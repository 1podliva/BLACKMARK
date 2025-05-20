const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

// Отримати всі категорії
router.get('/', getAllCategories);

// Створити нову категорію (захищений маршрут)
router.post('/', auth, createCategory);

// Оновити категорію (захищений маршрут)
router.put('/:id', auth, updateCategory);

// Видалити категорію (захищений маршрут)
router.delete('/:id', auth, deleteCategory);

module.exports = router;