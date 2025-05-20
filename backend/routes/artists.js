const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const { getAllArtists, createArtist, updateArtist, deleteArtist } = require('../controllers/artistController');

// Налаштування Multer для збереження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/artists');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Отримати всіх майстрів
router.get('/', getAllArtists);

// Створити нового майстра (тільки адмін)
router.post('/', auth, restrictToAdmin, upload.single('photo'), createArtist);

// Оновити майстра (тільки адмін)
router.put('/:id', auth, restrictToAdmin, upload.single('photo'), updateArtist);

// Видалити майстра (тільки адмін)
router.delete('/:id', auth, restrictToAdmin, deleteArtist);

module.exports = router;