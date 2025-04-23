const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path'); // Added import
const Post = require('../models/Post');
const Category = require('../models/Category');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post (protected)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, content, category, featured } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) return res.status(400).json({ message: 'Category does not exist' });

    const post = new Post({ title, content, image, category, featured });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error creating post' });
  }
});

// Update post (protected)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, content, category, featured } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  try {
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) return res.status(400).json({ message: 'Category does not exist' });

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, image, category, featured },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error updating post' });
  }
});

// Delete post (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;