const express = require('express');
const router = express.Router();
const GalleryCategory = require('../models/GalleryCategory');

// Get all gallery categories
router.get('/', async (req, res) => {
  try {
    const categories = await GalleryCategory.find();
    res.json(categories);
  } catch (err) {
    console.error('GET /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new gallery category
router.post('/', async (req, res) => {
  try {
    const category = new GalleryCategory({ name: req.body.name });
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('POST /api/gallery-categories Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update gallery category
router.put('/:id', async (req, res) => {
  try {
    const category = await GalleryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    console.error('PUT /api/gallery-categories Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete gallery category
router.delete('/:id', async (req, res) => {
  try {
    const category = await GalleryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;