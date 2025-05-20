const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  editComment,
  deleteComment,
  likePost,
  dislikePost,
  getPostStats,
  getPostLikes,
  ensureSingleFeatured,
} = require('../controllers/postController');

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/posts');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Отримати всі пости
router.get('/', getAllPosts);

// Отримати один пост за ID
router.get('/:id', getPostById);

// Додати новий пост
router.post('/', auth, upload.single('image'), ensureSingleFeatured, createPost);

// Оновити пост
router.put('/:id', auth, upload.single('image'), ensureSingleFeatured, updatePost);

// Видалити пост
router.delete('/:id', auth, deletePost);

// Додати коментар
router.post('/:id/comments', auth, addComment);

// Редагувати коментар
router.put('/:id/comments/:commentId', auth, editComment);

// Видалити коментар
router.delete('/:id/comments/:commentId', auth, deleteComment);

// Лайк поста
router.post('/:id/like', auth, likePost);

// Дизлайк поста
router.post('/:id/dislike', auth, dislikePost);

// Отримати статистику поста
router.get('/:id/stats', getPostStats);

// Отримати список лайків (тільки для адмінів)
router.get('/:id/likes', auth, restrictToAdmin, getPostLikes);

module.exports = router;