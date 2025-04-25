const express = require('express');
const Category = require('../models/Category');
const Post = require('../models/Post');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    console.log('Fetched categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('GET /api/categories Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (protected)
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  console.log('POST /api/categories body:', req.body);
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name });
    const savedCategory = await category.save();
    console.log('Saved category:', savedCategory);
    res.status(201).json(category);
  } catch (err) {
    console.error('POST /api/categories Error:', err);
    res.status(400).json({ message: 'Error creating category' });
  }
});

// Update category (protected)
router.put('/:id', auth, async (req, res) => {
  const { name } = req.body;
  console.log('PUT /api/categories/:id body:', req.body);
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existingCategory) return res.status(400).json({ message: 'Category name already exists' });

    category.name = name;
    const updatedCategory = await category.save();
    console.log('Updated category:', updatedCategory);
    res.json(category);
  } catch (err) {
    console.error('PUT /api/categories Error:', err);
    res.status(400).json({ message: 'Error updating category' });
  }
});

// Delete category (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const postCount = await Post.countDocuments({ category: category.name });
    if (postCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated posts' });
    }

    await Category.findByIdAndDelete(req.params.id);
    console.log('Deleted category ID:', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /api/categories Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;