const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const {
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
} = require('../controllers/bookingController');

// Отримати бронювання користувача
router.get('/', auth, getUserBookings);

// Отримати консультації користувача
router.get('/consultations', auth, getUserConsultations);

// Отримати всі бронювання (адмін)
router.get('/all', auth, restrictToAdmin, getAllBookings);

// Отримати всі консультації (адмін)
router.get('/consultations/all', auth, restrictToAdmin, getAllConsultations);

// Створити нове бронювання (адмін)
router.post('/', auth, restrictToAdmin, createBooking);

// Створити запит на консультацію
router.post('/consultations', auth, createConsultation);

// Перевірка доступності
router.get('/availability', auth, checkAvailability);

// Скасувати бронювання (користувач, тільки для createdByAdmin)
router.put('/:id/cancel', auth, cancelBooking);

// Запит на скасування бронювання (користувач)
router.put('/:id/request-cancel', auth, requestCancelBooking);

// Скасувати консультацію (користувач)
router.put('/consultations/:id/cancel', auth, cancelConsultation);

// Запит на скасування консультації (користувач)
router.put('/consultations/:id/request-cancel', auth, requestCancelConsultation);

// Оновити бронювання (адмін)
router.put('/:id', auth, restrictToAdmin, updateBooking);

// Оновити статус бронювання (адмін)
router.put('/:id/status', auth, restrictToAdmin, updateBookingStatus);

// Оновити статус консультації (адмін)
router.put('/consultations/:id/status', auth, restrictToAdmin, updateConsultationStatus);

// Видалити бронювання (адмін)
router.delete('/:id', auth, restrictToAdmin, deleteBooking);

// Видалити консультацію (адмін)
router.delete('/consultations/:id', auth, restrictToAdmin, deleteConsultation);

module.exports = router;