const express = require('express');
const router = express.Router();
const { getAllNotifications, markNotificationAsRead, handleContactForm } = require('../controllers/notificationController');

// Отримати всі сповіщення
router.get('/', getAllNotifications);

// Позначити сповіщення як прочитане
router.put('/:id/read', markNotificationAsRead);

// Обробка форми контактів
router.post('/contact', handleContactForm);

module.exports = router;