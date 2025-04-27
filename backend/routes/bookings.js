const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Отримати бронювання користувача
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('artist', 'name')
      .sort({ date: -1 });
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
      .populate('artist', 'name')
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

    // Валідація: artist має бути дійсним ObjectId
    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }

    // Перевірка існування майстра
    const artistData = await Artist.findById(artist);
    if (!artistData) {
      return res.status(404).json({ message: 'Майстер не знайдений' });
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

    // Витягуємо дані користувача
    const user = await User.findById(req.user.id).select('firstName lastName');
    if (!user) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${user.firstName} ${user.lastName}`.trim();

    // Створюємо сповіщення для всіх адмінів
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      message: `Нове бронювання від ${clientName} на ${new Date(date).toLocaleDateString('uk-UA')} о ${time}`,
      details: `Бронювання: ${clientName}, ${date}, ${time}, Майстер: ${artistData.name}`,
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
    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }
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

// Видалити бронювання (тільки адмін)
router.delete('/:id', auth, restrictToAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Бронювання видалено' });
  } catch (err) {
    console.error('DELETE /api/bookings/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;