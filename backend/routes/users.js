const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { getAllUsers, getProfile, updateProfile, changePassword } = require('../controllers/userController');

// Налаштування Multer для аватарок
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
router.get('/', auth, restrictToAdmin, getAllUsers);

// Отримати профіль
router.get('/profile', auth, getProfile);

// Оновити профіль
router.put('/profile', auth, upload.single('avatar'), updateProfile);

// Змінити пароль
router.put('/password', auth, changePassword);

module.exports = router;