const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { body, validationResult } = require('express-validator');
const { getAllSchedules, getArtistSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/artistScheduleController');

// Валідація для створення та оновлення графіку
const scheduleValidation = [
  body('artist').isMongoId().withMessage('Невірний ID майстра'),
  body('date').isISO8601().toDate().withMessage('Невірна дата'),
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
];

// Middleware для обробки помилок валідації
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Отримати всі графіки (адмін)
router.get('/', auth, restrictToAdmin, getAllSchedules);

// Отримати графік майстра
router.get('/:artistId', auth, getArtistSchedule);

// Створити графік (адмін)
router.post('/', auth, restrictToAdmin, scheduleValidation, validate, createSchedule);

// Оновити графік (адмін)
router.put('/:id', auth, restrictToAdmin, scheduleValidation, validate, updateSchedule);

// Видалити графік (адмін)
router.delete('/:id', auth, restrictToAdmin, deleteSchedule);

module.exports = router;