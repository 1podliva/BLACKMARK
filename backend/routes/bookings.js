const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Отримати бронювання користувача
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати всі бронювання (тільки адмін)
router.get('/all', auth, restrictToAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings/all Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити нове бронювання
router.post('/', auth, async (req, res) => {
  const { artist, date, time, description } = req.body;
  try {
    // Валідація: мінімум 24 години
    const selectedDateTime = new Date(`${date}T${time}`);
    const minBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (selectedDateTime < minBookingTime) {
      return res.status(400).json({ message: 'Бронювання можливе щонайменше за 24 години' });
    }

    const booking = new Booking({
      user: req.user.id,
      artist,
      date,
      time,
      description,
      status: 'pending',
    });
    await booking.save();

    // Створити сповіщення для всіх адмінів
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      message: `Нове бронювання від ${artist} на ${new Date(date).toLocaleDateString()} о ${time}`,
      user: admin._id,
      booking: booking._id,
      read: false,
    }));
    await Notification.insertMany(notifications);

    res.json(booking);
  } catch (err) {
    console.error('POST /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Перевірка доступності
router.get('/availability', async (req, res) => {
  try {
    const { artist, date } = req.query;
    const bookings = await Booking.find({
      artist,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });
    const bookedTimes = bookings.map((booking) => booking.time);
    res.json({ bookedTimes });
  } catch (err) {
    console.error('GET /api/bookings/availability Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити статус бронювання (тільки адмін)
router.put('/:id/status', auth, restrictToAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Невірний статус' });
    }
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('PUT /api/bookings/:id/status Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;