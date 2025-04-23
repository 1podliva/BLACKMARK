const express = require('express');
const jwt = require('jsonwebtoken');
const Category = require('../models/Category');
const Post = require('../models/Post');
const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Error creating category' });
  }
});

// Update category (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existingCategory) return res.status(400).json({ message: 'Category name already exists' });

    category.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: 'Error updating category' });
  }
});

// Delete category (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const postCount = await Post.countDocuments({ category: category.name });
    if (postCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated posts' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;