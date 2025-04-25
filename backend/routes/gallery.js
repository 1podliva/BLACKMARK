const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/gallery');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find();
    console.log('Fetched gallery images:', images);
    res.json(images);
  } catch (err) {
    console.error('GET /api/gallery Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new gallery image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { alt, title, description } = req.body;
    const styles = Array.isArray(req.body.styles) ? req.body.styles : (req.body.styles ? [req.body.styles] : []);
    console.log('Parsed styles:', styles);
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    if (!styles.length) return res.status(400).json({ message: 'At least one category is required' });
    const gallery = new Gallery({
      src: `/images/gallery/${req.file.filename}`,
      alt,
      title,
      description,
      styles,
    });
    const newGallery = await gallery.save();
    console.log('Saved gallery item:', newGallery);
    res.status(201).json(newGallery);
  } catch (err) {
    console.error('POST /api/gallery Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update gallery image
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Image not found' });
    const { alt, title, description } = req.body;
    const styles = Array.isArray(req.body.styles) ? req.body.styles : (req.body.styles ? [req.body.styles] : gallery.styles);
    console.log('Parsed styles for update:', styles);
    gallery.alt = alt || gallery.alt;
    gallery.title = title || gallery.title;
    gallery.description = description || gallery.description;
    gallery.styles = styles;
    if (req.file) {
      gallery.src = `/images/gallery/${req.file.filename}`;
    } else if (req.body.image) {
      gallery.src = req.body.image;
    }
    const updatedGallery = await gallery.save();
    console.log('Updated gallery item:', updatedGallery);
    res.json(updatedGallery);
  } catch (err) {
    console.error('PUT /api/gallery Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete gallery image
router.delete('/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Image not found' });
    await gallery.deleteOne();
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('DELETE /api/gallery Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;