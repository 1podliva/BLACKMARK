const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Artist = require('../models/Artist');
const ArtistSchedule = require('../models/ArtistSchedule');
const { sendNotification, notifyAdmins } = require('../utils/notificationHelper');

// Мапа статусів для відображення
const statusMap = {
  booking: {
    pending: 'На розгляді',
    confirmed: 'Підтверджено',
    cancelled: 'Скасовано',
    completed: 'Завершено',
  },
  consultation: {
    pending: 'На розгляді',
    reviewed: 'Розглянуто',
    cancelled: 'Скасовано',
    completed: 'Завершено',
  },
};

// Отримати бронювання користувача
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('artist', 'name')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримати консультації користувача
const getUserConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate('artist', 'name')
      .sort({ preferredDate: 1 });
    res.json(consultations);
  } catch (err) {
    console.error('GET /api/bookings/consultations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримати всі бронювання (адмін)
const getAllBookings = async (req, res) => {
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
};

// Отримати всі консультації (адмін)
const getAllConsultations = async (req, res) => {
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
};

// Створити нове бронювання (адмін)
const createBooking = async (req, res) => {
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
      createdByAdmin: true,
    });
    await booking.save();

    const userData = await User.findById(user).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

    await notifyAdmins(
      io,
      `Нове бронювання від ${clientName} для ${artistData.name} на ${new Date(date).toLocaleDateString('uk-UA')} о ${time}`,
      `Дата: ${new Date(date).toLocaleDateString('uk-UA')}, Час: ${time}, Статус: ${statusMap.booking[booking.status]}`,
      { ...booking, artist: artistData },
      'booking'
    );

    res.json(booking);
  } catch (err) {
    console.error('POST /api/bookings Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Створити запит на консультацію
const createConsultation = async (req, res) => {
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

    const targetDate = new Date(preferredDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    let schedule = await ArtistSchedule.findOne({
      artist: new mongoose.Types.ObjectId(artist),
      date: { $gte: startOfDay, $lt: endOfDay },
    });

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
      createdByAdmin: false,
    });
    await consultation.save();

    const userData = await User.findById(req.user.id).select('firstName lastName');
    if (!userData) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }
    const clientName = `${userData.firstName} ${userData.lastName}`.trim();

    await notifyAdmins(
      io,
      `Новий запит на консультацію від ${clientName} для ${artistData.name} на ${new Date(parsedDate).toLocaleDateString('uk-UA')} о ${time}`,
      `Дата: ${new Date(parsedDate).toLocaleDateString('uk-UA')}, Час: ${time}, Статус: ${statusMap.consultation[consultation.status]}`,
      { ...consultation, artist: artistData },
      'consultation'
    );

    res.json(consultation);
  } catch (err) {
    console.error('POST /api/bookings/consultations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Перевірка доступності
const checkAvailability = async (req, res) => {
  try {
    const { artist, date } = req.query;
    if (!artist || !date) {
      return res.status(400).json({ message: 'Artist and date are required' });
    }
    if (!mongoose.isValidObjectId(artist)) {
      return res.status(400).json({ message: 'Invalid artist ID' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
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

    const consultations = await Consultation.find({
      artist,
      preferredDate: { $gte: startOfDayCheck, $lt: endOfDayCheck },
      status: { $ne: 'cancelled' },
    });
    const consultationTimes = consultations.map((c) => c.time);

    const finalAvailableTimes = availableTimes.filter(
      (time) => !bookedTimes.includes(time) && !consultationTimes.includes(time)
    );

    res.json({ bookedTimes: [...bookedTimes, ...consultationTimes], availableTimes: finalAvailableTimes });
  } catch (err) {
    console.error('GET /api/bookings/availability Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Скасувати бронювання (користувач, тільки для createdByAdmin)
const cancelBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
    if (!booking.createdByAdmin) {
      return res.status(403).json({ message: 'Скасувати можна лише бронювання, створене менеджером' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Бронювання вже скасовано' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Завершене бронювання не можна скасувати' });
    }
    if (booking.status !== 'pending') {
      return res.status(403).json({ message: 'Скасувати можна лише бронювання зі статусом "На розгляді"' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await sendNotification(
      io,
      `Ваше бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time} скасовано`,
      `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}, Статус: ${statusMap.booking[booking.status]}`,
      booking.user._id,
      booking,
      'booking'
    );

    await notifyAdmins(
      io,
      `Користувач ${booking.user.firstName} ${booking.user.lastName} скасував бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time}`,
      `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}, Статус: ${statusMap.booking[booking.status]}`,
      booking,
      'booking'
    );

    res.json(booking);
  } catch (err) {
    console.error('PUT /api/bookings/:id/cancel Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Запит на скасування бронювання (користувач)
const requestCancelBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Бронювання вже скасовано' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Завершене бронювання не можна скасувати' });
    }

    await notifyAdmins(
      io,
      `Користувач ${booking.user.firstName} ${booking.user.lastName} просить скасувати бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time}`,
      `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}, Статус: ${statusMap.booking[booking.status]}`,
      booking,
      'booking'
    );

    res.json({ message: 'Запит на скасування надіслано' });
  } catch (err) {
    console.error('PUT /api/bookings/:id/request-cancel Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Скасувати консультацію (користувач)
const cancelConsultation = async (req, res) => {
  const io = req.app.get('io');
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });
    if (consultation.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
    if (consultation.status === 'cancelled') {
      return res.status(400).json({ message: 'Консультація вже скасована' });
    }
    if (consultation.status === 'completed') {
      return res.status(400).json({ message: 'Завершена консультація не може бути скасована' });
    }
    if (consultation.status !== 'pending') {
      return res.status(403).json({ message: 'Скасувати можна лише консультацію зі статусом "На розгляді"' });
    }

    consultation.status = 'cancelled';
    await consultation.save();

    await sendNotification(
      io,
      `Ваша консультація з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time} скасована`,
      `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}, Статус: ${statusMap.consultation[consultation.status]}`,
      consultation.user._id,
      consultation,
      'consultation'
    );

    await notifyAdmins(
      io,
      `Користувач ${consultation.user.firstName} ${consultation.user.lastName} скасував консультацію з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time}`,
      `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}, Статус: ${statusMap.consultation[consultation.status]}`,
      consultation,
      'consultation'
    );

    res.json(consultation);
  } catch (err) {
    console.error('PUT /api/bookings/consultations/:id/cancel Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Запит на скасування консультації (користувач)
const requestCancelConsultation = async (req, res) => {
  const io = req.app.get('io');
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });
    if (consultation.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
    if (consultation.status === 'cancelled') {
      return res.status(400).json({ message: 'Консультація вже скасована' });
    }
    if (consultation.status === 'completed') {
      return res.status(400).json({ message: 'Завершена консультація не може бути скасована' });
    }

    await notifyAdmins(
      io,
      `Користувач ${consultation.user.firstName} ${consultation.user.lastName} просить скасувати консультацію з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time}`,
      `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}, Статус: ${statusMap.consultation[consultation.status]}`,
      consultation,
      'consultation'
    );

    res.json({ message: 'Запит на скасування надіслано' });
  } catch (err) {
    console.error('PUT /api/bookings/consultations/:id/request-cancel Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Оновити бронювання (адмін)
const updateBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { user, artist, date, time, description } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });

    if (user && !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Невірний ID клієнта' });
    }
    if (artist && !mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }

    const updatedFields = {};
    if (user) {
      const userExists = await User.findById(user);
      if (!userExists) return res.status(404).json({ message: 'Клієнт не знайдений' });
      updatedFields.user = user;
    }
    if (artist) {
      const artistExists = await Artist.findById(artist);
      if (!artistExists) return res.status(404).json({ message: 'Майстер не знайдений' });
      updatedFields.artist = artist;
    }
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Невірний формат дати' });
      }
      const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (parsedDate < minDate) {
        return res.status(400).json({ message: 'Дата має бути щонайменше за 24 години' });
      }
      updatedFields.date = parsedDate;
    }
    if (time) updatedFields.time = time;
    if (description) updatedFields.description = description;

    if (date || time) {
      const targetDate = new Date(date || booking.date);
      const checkTime = time || booking.time;
      const startOfDayCheck = new Date(targetDate);
      startOfDayCheck.setHours(0, 0, 0, 0);
      const endOfDayCheck = new Date(targetDate);
      endOfDayCheck.setHours(23, 59, 59, 999);

      const checkArtist = artist || booking.artist._id;
      const existingBookings = await Booking.find({
        artist: checkArtist,
        date: { $gte: startOfDayCheck, $lte: endOfDayCheck },
        time: checkTime,
        _id: { $ne: booking._id },
        status: { $ne: 'cancelled' },
      });

      if (existingBookings.length > 0) {
        return res.status(400).json({ message: 'Цей час уже заброньовано' });
      }

      const existingConsultations = await Consultation.find({
        artist: checkArtist,
        preferredDate: { $gte: startOfDayCheck, $lte: endOfDayCheck },
        time: checkTime,
        _id: { $ne: booking._id },
        status: { $ne: 'cancelled' },
      });

      if (existingConsultations.length > 0) {
        return res.status(400).json({ message: 'Цей час уже зайнято консультацією' });
      }
    }

    Object.assign(booking, updatedFields);
    await booking.save();

    const updatedBooking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');

    await sendNotification(
      io,
      `Ваше бронювання з ${updatedBooking.artist.name} на ${new Date(updatedBooking.date).toLocaleDateString('uk-UA')} о ${updatedBooking.time} було оновлено`,
      `Дата: ${new Date(updatedBooking.date).toLocaleDateString('uk-UA')}, Час: ${updatedBooking.time}, Статус: ${statusMap.booking[updatedBooking.status]}`,
      updatedBooking.user._id,
      updatedBooking,
      'booking'
    );

    res.json(updatedBooking);
  } catch (err) {
    console.error('PUT /api/bookings/:id Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Оновити статус бронювання (адмін)
const updateBookingStatus = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Невірний статус' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });

    booking.status = status;
    await booking.save();

    await sendNotification(
      io,
      `Статус вашого бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time} змінено на "${statusMap.booking[status]}"`,
      `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}`,
      booking.user._id,
      booking,
      'booking'
    );

    res.json(booking);
  } catch (err) {
    console.error('PUT /api/bookings/:id/status Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Оновити статус консультації (адмін)
const updateConsultationStatus = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Невірний статус' });
    }

    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });

    consultation.status = status;
    await consultation.save();

    await sendNotification(
      io,
      `Статус вашої консультації з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time} змінено на "${statusMap.consultation[status]}"`,
      `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}`,
      consultation.user._id,
      consultation,
      'consultation'
    );

    res.json(consultation);
  } catch (err) {
    console.error('PUT /api/bookings/consultations/:id/status Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Видалити бронювання (адмін)
const deleteBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });

    await booking.deleteOne();

    await sendNotification(
      io,
      `Ваше бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time} було видалено адміністратором`,
      `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}, Статус: ${statusMap.booking[booking.status]}`,
      booking.user._id,
      booking,
      'booking'
    );

    res.json({ message: 'Бронювання видалено' });
  } catch (err) {
    console.error('DELETE /api/bookings/:id Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Видалити консультацію (адмін)
const deleteConsultation = async (req, res) => {
  const io = req.app.get('io');
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('artist', 'name');
    if (!consultation) return res.status(404).json({ message: 'Консультацію не знайдено' });

    await consultation.deleteOne();

    await sendNotification(
      io,
      `Вашу консультацію з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time} було видалено адміністратором`,
      `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}, Статус: ${statusMap.consultation[consultation.status]}`,
      consultation.user._id,
      consultation,
      'consultation'
    );

    res.json({ message: 'Консультацію видалено' });
  } catch (err) {
    console.error('DELETE /api/bookings/consultations/:id Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserBookings,
  getUserConsultations,
  getAllBookings,
  getAllConsultations,
  createBooking,
  createConsultation,
  checkAvailability,
  cancelBooking,
  requestCancelBooking,
  cancelConsultation,
  requestCancelConsultation,
  updateBooking,
  updateBookingStatus,
  updateConsultationStatus,
  deleteBooking,
  deleteConsultation,
};