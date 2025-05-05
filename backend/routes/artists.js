const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Отримати всіх майстрів з повною інформацією
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    console.error('GET /api/artists Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Створити нового майстра (тільки адмін)
router.post('/', auth, restrictToAdmin, upload.single('photo'), async (req, res) => {
  const { name, description, age, experience } = req.body;
  try {
    const photo_url = req.file ? `/public/artists/${req.file.filename}` : '';
    const artist = new Artist({ name, description, age, experience, photo_url });
    await artist.save();
    res.status(201).json(artist);
  } catch (err) {
    console.error('POST /api/artists Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити майстра (тільки адмін)
router.put('/:id', auth, restrictToAdmin, upload.single('photo'), async (req, res) => {
  const { name, description, age, experience } = req.body;
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Майстра не знайдено' });

    artist.name = name || artist.name;
    artist.description = description || artist.description;
    artist.age = age || artist.age;
    artist.experience = experience || artist.experience;
    if (req.file) {
      // Видалимо старе фото, якщо воно існує
      if (artist.photo_url && fs.existsSync(path.join(__dirname, '../public', artist.photo_url))) {
        fs.unlinkSync(path.join(__dirname, '../public', artist.photo_url));
      }
      artist.photo_url = `/public/artists/${req.file.filename}`;
    }

    await artist.save();
    res.json(artist);
  } catch (err) {
    console.error('PUT /api/artists/:id Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Видалити майстра (тільки адмін)
router.delete('/:id', auth, restrictToAdmin, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Майстра не знайдено' });
    if (artist.photo_url && fs.existsSync(path.join(__dirname, '../public', artist.photo_url))) {
      fs.unlinkSync(path.join(__dirname, '../public', artist.photo_url));
    }
    await artist.remove();
    res.json({ message: 'Майстра видалено' });
  } catch (err) {
    console.error('DELETE /api/artists/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;