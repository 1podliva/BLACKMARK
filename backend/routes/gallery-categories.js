const express = require('express');
const router = express.Router();
const GalleryCategory = require('../models/GalleryCategory');
const auth = require('../middleware/auth');

// Get all gallery categories
router.get('/', async (req, res) => {
  try {
    const categories = await GalleryCategory.find();
    console.log('Fetched gallery categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('GET /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new gallery category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    console.log('POST /api/gallery-categories body:', req.body);
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = new GalleryCategory({ name });
    const newCategory = await category.save();
    console.log('Saved gallery category:', newCategory);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('POST /api/gallery-categories Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete gallery category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await GalleryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.deleteOne();
    console.log('Deleted gallery category ID:', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;