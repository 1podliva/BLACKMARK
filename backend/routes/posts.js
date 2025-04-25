const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/posts');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    console.log('Fetched posts:', posts);
    res.json(posts);
  } catch (err) {
    console.error('GET /api/posts Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('GET /api/posts/:id Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new post (admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    const { title, content, category, featured } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }
    const post = new Post({
      title,
      content,
      category,
      featured: featured === 'true' || featured === true,
      image: req.file ? `/images/posts/${req.file.filename}` : null,
    });
    const newPost = await post.save();
    console.log('Saved post:', newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.error('POST /api/posts Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update post (admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const { title, content, category, featured } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.featured = featured !== undefined ? (featured === 'true' || featured === true) : post.featured;
    if (req.file) {
      post.image = `/images/posts/${req.file.filename}`;
    } else if (req.body.image) {
      post.image = req.body.image;
    }
    const updatedPost = await post.save();
    console.log('Updated post:', updatedPost);
    res.json(updatedPost);
  } catch (err) {
    console.error('PUT /api/posts Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete post (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.deleteOne();
    console.log('Deleted post ID:', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /api/posts Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;