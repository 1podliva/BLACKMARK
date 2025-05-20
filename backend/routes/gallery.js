const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { getAllGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/gallery');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Отримати всі зображення галереї
router.get('/', getAllGalleryImages);

// Додати нове зображення в галерею (захищений маршрут)
router.post('/', auth, upload.single('image'), createGalleryImage);

// Оновити зображення в галереї (захищений маршрут)
router.put('/:id', auth, upload.single('image'), updateGalleryImage);

// Видалити зображення з галереї (захищений маршрут)
router.delete('/:id', auth, deleteGalleryImage);

module.exports = router;