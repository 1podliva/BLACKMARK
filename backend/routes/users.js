const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Multer для аватарок
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Отримати список всіх користувачів (тільки для адмінів)
router.get('/', auth, restrictToAdmin, async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName');
    res.json(users);
  } catch (err) {
    console.error('GET /api/users Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати профіль
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/users/profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити профіль
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    if (req.file) {
      user.avatar = `/images/avatars/${req.file.filename}`;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('PUT /api/users/profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Змінити пароль
router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('PUT /api/users/password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;