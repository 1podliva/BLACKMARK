const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { register, login, verifyToken, forgotPassword, resetPassword, checkAdmin, getMe } = require('../controllers/authController');

// Реєстрація
router.post('/register', register);

// Вхід
router.post('/login', login);

// Перевірка токена
router.get('/verify', auth, verifyToken);

// Запит на скидання пароля
router.post('/forgot-password', forgotPassword);

// Скидання пароля
router.post('/reset-password', resetPassword);

// Перевірка адмін-доступу
router.get('/check-admin', auth, restrictToAdmin, checkAdmin);

// Отримати дані користувача
router.get('/me', auth, getMe);

module.exports = router;