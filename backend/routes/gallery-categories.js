const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllGalleryCategories, createGalleryCategory, deleteGalleryCategory } = require('../controllers/galleryCategoryController');

// Отримати всі категорії галереї
router.get('/', getAllGalleryCategories);

// Створити нову категорію галереї (захищений маршрут)
router.post('/', auth, createGalleryCategory);

// Видалити категорію галереї (захищений маршрут)
router.delete('/:id', auth, deleteGalleryCategory);

module.exports = router;