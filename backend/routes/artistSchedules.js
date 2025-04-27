const express = require('express');
const router = express.Router();
const ArtistSchedule = require('../models/ArtistSchedule');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { body, validationResult } = require('express-validator');

// Отримати графік майстра
router.get('/:artistId', auth, async (req, res) => {
  try {
    const schedules = await ArtistSchedule.find({ artist: req.params.artistId });
    res.json(schedules);
  } catch (err) {
    console.error('GET /api/artist-schedules/:artistId Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити графік (тільки адмін)
router.post(
  '/',
  [
    auth,
    restrictToAdmin,
    body('artist').isMongoId().withMessage('Invalid artist ID'),
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Invalid day of week'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { artist, dayOfWeek, startTime, endTime } = req.body;
      const schedule = new ArtistSchedule({ artist, dayOfWeek, startTime, endTime });
      await schedule.save();
      res.status(201).json(schedule);
    } catch (err) {
      console.error('POST /api/artist-schedules Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;