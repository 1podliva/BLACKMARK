const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ArtistSchedule = require('../models/ArtistSchedule');
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { body, validationResult } = require('express-validator');

// Отримати графік майстра
router.get('/:artistId', auth, async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: 'Невірний ID майстра' });
    }
    const schedules = await ArtistSchedule.find({ artist: artistId });
    res.json(schedules);
  } catch (err) {
    console.error('GET /api/artist-schedules/:artistId Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити або оновити графік (тільки адмін)
router.post(
  '/',
  [
    auth,
    restrictToAdmin,
    body('artist').isMongoId().withMessage('Невірний ID майстра'),
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Невірний день тижня'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Невірний формат часу початку'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Невірний формат часу закінчення'),
    body().custom(({ startTime, endTime }) => {
      if (startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        if (start >= end) {
          throw new Error('Час закінчення має бути пізніше за час початку');
        }
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { artist, dayOfWeek, startTime, endTime } = req.body;

      // Перевірка існування майстра
      const artistData = await Artist.findById(artist);
      if (!artistData) {
        return res.status(404).json({ message: 'Майстер не знайдений' });
      }

      // Оновлення або створення графіку
      const schedule = await ArtistSchedule.findOneAndUpdate(
        { artist, dayOfWeek },
        { startTime, endTime },
        { upsert: true, new: true }
      );
      res.status(201).json(schedule);
    } catch (err) {
      console.error('POST /api/artist-schedules Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Видалити графік (тільки адмін)
router.delete('/:id', auth, restrictToAdmin, async (req, res) => {
  try {
    const schedule = await ArtistSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Графік не знайдено' });
    }
    await ArtistSchedule.deleteOne({ _id: req.params.id });
    res.json({ message: 'Графік видалено' });
  } catch (err) {
    console.error('DELETE /api/artist-schedules/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;