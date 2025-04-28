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
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати консультації користувача
router.get('/consultations', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ 
      user: req.user.id,
    })
      .populate('artist', 'name')
      .sort({ preferredDate: 1 });
    res.json(consultations);
  } catch (err) {
    console.error('GET /api/bookings/consultations Error:', err);
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

// Отримати всі консультації (тільки адмін)
router.get('/consultations/all', auth, restrictToAdmin, async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', 'firstName lastName email')
      .populate('artist', 'name')
      .sort({ preferredDate: -1 });
    res.json(consultations);
  } catch (err) {
    console.error('GET /api/bookings/consultations/all Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити нове бронювання (тільки адмін)
router.post('/', auth, restrictToAdmin, async (req, res) => {
  const { artist, date, time, description, user } = req.body;
  const io = req.app.get('io');
  try {
    const selectedDateTime = new Date(`${date}T${time}`);
    const minBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (selectedDateTime < minBookingTime) {
      return res.status(400).json({ message: 'Бронювання можливе щонайменше за 24 години' });
    }

    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }

    const artistData = await Artist.findById(artist);
    if (!artistData) {
      return res.status(404).json({ message: 'Майстер не знайдений' });
    }

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

    const userData = await User.findById(user).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

    const admins = await User.find({ role: 'admin' });
    if (admins.length === 0) {
      return res.status(500).json({ message: 'Адміністратори не знайдені' });
    }
    const notification = {
      message: `Нове бронювання від ${clientName} для ${artistData.name} на ${new Date(date).toLocaleDateString('uk-UA')} о ${time}`,
      details: `Дата: ${new Date(date).toLocaleDateString('uk-UA')}, Час: ${time}`,
      user: admins[0]._id, // Сповіщення для першого адміна
      booking: booking._id,
      read: false,
    };
    const savedNotification = await new Notification(notification).save();

    // Відправка сповіщення через WebSocket
    io.emit('newNotification', {
      ...savedNotification._doc,
      booking: { ...booking._doc, artist: { name: artistData.name } },
    });

    res.json(booking);
  } catch (err) {
    console.error('POST /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити запит на консультацію
router.post('/consultations', auth, async (req, res) => {
  const { artist, preferredDate, time } = req.body;
  const io = req.app.get('io');
  try {
    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }

    const artistData = await Artist.findById(artist);
    if (!artistData) {
      return res.status(404).json({ message: 'Майстер не знайдений' });
    }

    if (!preferredDate) {
      return res.status(400).json({ message: 'Дата обов’язкова' });
    }
    const parsedDate = new Date(preferredDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Невірний формат дати' });
    }
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (parsedDate < minDate) {
      return res.status(400).json({ message: 'Дата консультації має бути щонайменше за 24 години' });
    }

    if (!time) {
      return res.status(400).json({ message: 'Час обов’язковий' });
    }

    // Перевірка доступності слота
    const targetDate = new Date(preferredDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    let schedule = await ArtistSchedule.findOne({
      artist: new mongoose.Types.ObjectId(artist),
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!schedule) {
      const dayOfWeek = targetDate.getDay();
      schedule = await ArtistSchedule.findOne({
        artist: new mongoose.Types.ObjectId(artist),
        dayOfWeek,
      });
    }

    if (!schedule) {
      return res.status(400).json({ message: 'Графік майстра не знайдено на цей день' });
    }

    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    const availableTimes = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    while (
      (currentHour < endHour) ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      availableTimes.push(
        `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      );
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    if (!availableTimes.includes(time)) {
      return res.status(400).json({ message: 'Обраний час недоступний' });
    }

    const startOfDayCheck = new Date(parsedDate);
    startOfDayCheck.setHours(0, 0, 0, 0);
    const endOfDayCheck = new Date(parsedDate);
    endOfDayCheck.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      artist,
      date: { $gte: startOfDayCheck, $lte: endOfDayCheck },
      time,
    });
    if (bookings.length > 0) {
      return res.status(400).json({ message: 'Цей час уже заброньовано' });
    }

    const consultations = await Consultation.find({
      artist,
      preferredDate: { $gte: startOfDayCheck, $lte: endOfDayCheck },
      time,
    });
    if (consultations.length > 0) {
      return res.status(400).json({ message: 'Цей час уже зайнято консультацією' });
    }

    const consultation = new Consultation({
      user: req.user.id,
      artist,
      description: 'Консультація',
      preferredDate: startOfDayCheck,
      time,
      status: 'pending',
    });
    await consultation.save();

    const userData = await User.findById(req.user.id).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

    const admins = await User.find({ role: 'admin' });
    if (admins.length === 0) {
      return res.status(500).json({ message: 'Адміністратори не знайдені' });
    }
    const notification = {
      message: `Новий запит на консультацію від ${clientName} для ${artistData.name} на ${new Date(parsedDate).toLocaleDateString('uk-UA')} о ${time}`,
      details: `Дата: ${new Date(parsedDate).toLocaleDateString('uk-UA')}, Час: ${time}`,
      user: admins[0]._id, // Сповіщення для першого адміна
      consultation: consultation._id,
      read: false,
    };
    const savedNotification = await new Notification(notification).save();

    // Відправка сповіщення через WebSocket
    io.emit('newNotification', {
      ...savedNotification._doc,
      consultation: { ...consultation._doc, artist: { name: artistData.name } },
    });

    res.json(consultation);
  } catch (err) {
    console.error('POST /api/bookings/consultations Error:', err);
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

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    let schedule = await ArtistSchedule.findOne({
      artist: new mongoose.Types.ObjectId(artist),
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!schedule) {
      const dayOfWeek = targetDate.getDay();
      console.log('No date-based schedule found, checking dayOfWeek:', dayOfWeek);
      schedule = await ArtistSchedule.findOne({
        artist: new mongoose.Types.ObjectId(artist),
        dayOfWeek,
      });
    }

    console.log('Schedule:', schedule);
    if (!schedule) {
      console.log('No schedule found for this artist and day');
      return res.json({ bookedTimes: [], availableTimes: [] });
    }

    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    const availableTimes = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    while (
      (currentHour < endHour) ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      availableTimes.push(
        `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      );
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    console.log('Generated available times:', availableTimes);

    const startOfDayCheck = new Date(date);
    startOfDayCheck.setHours(0, 0, 0, 0);
    const endOfDayCheck = new Date(date);
    endOfDayCheck.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      artist,
      date: { $gte: startOfDayCheck, $lte: endOfDayCheck },
      status: { $ne: 'cancelled' },
    });
    const bookedTimes = bookings.map((b) => b.time);
    console.log('Booked times:', bookedTimes);

    const consultations = await Consultation.find({
      artist,
      preferredDate: { $gte: startOfDayCheck, $lt: endOfDayCheck },
      status: { $ne: 'cancelled' },
    });
    console.log('Consultations found:', consultations);
    const consultationTimes = consultations.map((c) => c.time);
    console.log('Consultation times:', consultationTimes);

    const finalAvailableTimes = availableTimes.filter(
      (time) => !bookedTimes.includes(time) && !consultationTimes.includes(time)
    );
    console.log('Final available times:', finalAvailableTimes);

    res.json({ bookedTimes: [...bookedTimes, ...consultationTimes], availableTimes: finalAvailableTimes });
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

// Оновити статус консультації (тільки адмін)
router.put('/consultations/:id/status', auth, restrictToAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });
    if (!['pending', 'reviewed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Невірний статус' });
    }
    consultation.status = status;
    await consultation.save();
    res.json(consultation);
  } catch (err) {
    console.error('PUT /api/bookings/consultations/:id/status Error:', err.message, err.stack);
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

// Видалити консультацію (тільки адмін)
router.delete('/consultations/:id', auth, restrictToAdmin, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });
    await Consultation.deleteOne({ _id: req.params.id });
    res.json({ message: 'Консультацію видалено' });
  } catch (err) {
    console.error('DELETE /api/bookings/consultations/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;