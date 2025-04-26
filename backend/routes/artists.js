const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Отримати всіх майстрів
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
router.post('/', auth, restrictToAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const artist = new Artist({ name });
    await artist.save();
    res.json(artist);
  } catch (err) {
    console.error('POST /api/artists Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Оновити майстра (тільки адмін)
router.put('/:id', auth, restrictToAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Майстра не знайдено' });
    artist.name = name;
    await artist.save();
    res.json(artist);
  } catch (err) {
    console.error('PUT /api/artists/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Видалити майстра (тільки адмін)
router.delete('/:id', auth, restrictToAdmin, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Майстра не знайдено' });
    await artist.remove();
    res.json({ message: 'Майстра видалено' });
  } catch (err) {
    console.error('DELETE /api/artists/:id Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;