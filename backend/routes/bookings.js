const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Artist = require('../models/Artist');
const ArtistSchedule = require('../models/ArtistSchedule');
const Consultation = require('../models/Consultation');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Отримати бронювання користувача
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user.id,
    })
      .populate('artist', 'name')
      .sort({ date: 1 }); // Сортуємо за датою (ближчі перші)
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

// Створити нове бронювання (тільки адмін)
router.post('/', auth, restrictToAdmin, async (req, res) => {
  const { artist, date, time, description, user } = req.body;
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

    // Перевірка користувача
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Невірний ID клієнта' });
    }
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: 'Клієнт не знайдений' });
    }

    const booking = new Booking({
      user,
      artist,
      date,
      time,
      description,
      status: 'pending',
    });
    await booking.save();

    // Витягуємо дані користувача
    const userData = await User.findById(user).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

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

// Створити запит на консультацію
router.post('/consultations', auth, async (req, res) => {
  const { artist, preferredDate } = req.body;
  try {
    // Валідація: artist має бути дійсним ObjectId
    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }

    // Перевірка існування майстра
    const artistData = await Artist.findById(artist);
    if (!artistData) {
      return res.status(404).json({ message: 'Майстер не знайдений' });
    }

    // Якщо є preferredDate, валідуємо формат
    if (preferredDate) {
      const parsedDate = new Date(preferredDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Невірний формат дати' });
      }
      const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (parsedDate < minDate) {
        return res.status(400).json({ message: 'Дата консультації має бути щонайменше за 24 години' });
      }
    }

    const consultation = new Consultation({
      user: req.user.id,
      artist,
      description: 'Консультація',
      preferredDate: preferredDate || null,
      status: 'pending',
    });
    await consultation.save();

    // Витягуємо дані користувача
    const userData = await User.findById(req.user.id).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

    // Створюємо сповіщення для всіх адмінів
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      message: `Новий запит на консультацію від ${clientName}`,
      details: `Консультація: ${clientName}, Майстер: ${artistData.name}${preferredDate ? `, Бажана дата: ${new Date(preferredDate).toLocaleDateString('uk-UA')}` : ''}`,
      user: admin._id,
      consultation: consultation._id,
      read: false,
    }));
    await Notification.insertMany(notifications);

    res.json(consultation);
  } catch (err) {
    console.error('POST /api/consultations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Перевірка доступності
router.get('/availability', auth, async (req, res) => {
  try {
    const { artist, date } = req.query;
    console.log('Received availability request:', { artist, date });
    if (!artist || !date) {
      return res.status(400).json({ message: 'Artist and date are required' });
    }
    if (!mongoose.isValidObjectId(artist)) {
      return res.status(400).json({ message: 'Invalid artist ID' });
    }

    console.log(`Checking availability for artist: ${artist}, date: ${date}, user: ${req.user.id}`);

    // Валідація формату дати
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Отримати графік майстра
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const schedule = await ArtistSchedule.findOne({ artist, dayOfWeek });
    console.log('Schedule:', schedule);
    if (!schedule) {
      console.log('No schedule found for this artist and day');
      return res.json({ bookedTimes: [], availableTimes: [] });
    }

    // Генерувати слоти на основі графіку
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    const availableTimes = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      availableTimes.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    console.log('Generated available times:', availableTimes);

    // Отримати заброньовані слоти
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const bookings = await Booking.find({
      artist,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const bookedTimes = bookings.map((b) => b.time);
    console.log('Booked times:', bookedTimes);

    // Фільтрувати доступні слоти
    const finalAvailableTimes = availableTimes.filter((time) => !bookedTimes.includes(time));
    console.log('Final available times:', finalAvailableTimes);

    res.json({ bookedTimes, availableTimes: finalAvailableTimes });
  } catch (err) {
    console.error('GET /api/bookings/availability Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити статус бронювання (тільки адмін)
router.put('/:id/status', auth, restrictToAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Невірний статус' });
    }
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('PUT /api/bookings/:id/status Error:', err.message, err.stack);
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