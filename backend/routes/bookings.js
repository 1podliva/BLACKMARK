const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Отримати бронювання користувача
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити нове бронювання
router.post('/', auth, async (req, res) => {
  try {
    const { artist, date, time, description } = req.body;
    if (!artist || !date || !time) {
      return res.status(400).json({ message: 'Artist, date, and time are required' });
    }

    const booking = new Booking({
      userId: req.user.id,
      artist,
      date,
      time,
      description,
      status: 'pending',
    });

    await booking.save();

    // Замість відправки email виводимо деталі в консоль
    const user = await User.findById(req.user.id);
    console.log('New booking:', {
      user: `${user.firstName} ${user.lastName}`,
      email: user.email,
      artist,
      date,
      time,
      description: description || 'Немає',
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('POST /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати всі бронювання (для адмін-панелі)
router.get('/all', auth, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings/all Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити статус бронювання (для адмін-панелі)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status || booking.status;
    await booking.save();

    // Замість відправки email виводимо оновлення в консоль
    const user = await User.findById(booking.userId);
    console.log('Booking status updated:', {
      user: `${user.firstName} ${user.lastName}`,
      email: user.email,
      bookingId: booking._id,
      status,
      comment: comment || 'Немає',
    });

    res.json(booking);
  } catch (err) {
    console.error('PUT /api/bookings/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;