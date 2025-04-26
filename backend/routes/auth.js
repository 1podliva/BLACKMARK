const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Реєстрація
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
    });

    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('POST /api/auth/register Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Вхід
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('POST /api/auth/login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Перевірка токена
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({ message: 'Token is valid', user: req.user });
  } catch (err) {
    console.error('GET /api/auth/verify Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Запит на скидання пароля
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Замість відправки email виводимо посилання в консоль
    console.log('Password reset link:', { email, resetLink });

    res.json({ message: 'Password reset link generated (check server console)' });
  } catch (err) {
    console.error('POST /api/auth/forgot-password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Скидання пароля
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('POST /api/auth/reset-password Error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Новий роут для перевірки адмін-доступу
router.get('/check-admin', auth, restrictToAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// Отримати дані користувача
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/auth/me Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;