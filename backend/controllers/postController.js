const Post = require('../models/Post');

// Переконатися, що лише один пост може бути виділеним
const ensureSingleFeatured = async (req, res, next) => {
  if (req.body.featured) {
    await Post.updateMany({ featured: true, _id: { $ne: req.body.id || req.params.id } }, { featured: false });
  }
  next();
};

// Отримати всі пости
const getAllPosts = async (req, res) => {
  try {
    const isAdmin = req.headers.authorization;
    const query = isAdmin ? {} : { status: 'published' };
    const posts = await Post.find(query).populate('comments.user', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    console.error('GET /api/posts Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Отримати один пост за ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'firstName lastName');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const isAdmin = req.headers.authorization;
    if (!isAdmin && post.status !== 'published') {
      return res.status(403).json({ message: 'Post is not published' });
    }
    res.json(post);
  } catch (err) {
    console.error('GET /api/posts/:id Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Додати новий пост
const createPost = async (req, res) => {
  try {
    const { title, content, category, status } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }
    const post = new Post({
      title,
      content,
      category,
      status: status || 'draft',
      featured: req.body.featured === 'true' || req.body.featured === true,
      image: req.file ? `/images/posts/${req.file.filename}` : null,
    });
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('POST /api/posts Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Оновити пост
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const { title, content, category, status, featured } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.status = status || post.status;
    post.featured = featured !== undefined ? (featured === 'true' || featured === true) : post.featured;
    if (req.file) post.image = `/images/posts/${req.file.filename}`;
    else if (req.body.image) post.image = req.body.image;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    console.error('PUT /api/posts Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Видалити пост
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /api/posts Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Додати коментар
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'firstName lastName');
    res.status(201).json(updatedPost);
  } catch (err) {
    console.error('POST /api/posts/:id/comments Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Редагувати коментар
const editComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    comment.text = text;
    comment.isEdited = true;
    await post.save();
    const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'firstName lastName');
    res.json(updatedPost);
  } catch (err) {
    console.error('PUT /api/posts/:id/comments/:commentId Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Видалити коментар
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ви можете видаляти лише власні коментарі, якщо ви не адміністратор' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'firstName lastName');
    res.json(updatedPost);
  } catch (err) {
    console.error('DELETE /api/posts/:id/comments/:commentId Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Лайк поста
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id;
    if (post.dislikes.includes(userId)) post.dislikes.pull(userId);
    if (!post.likes.includes(userId)) post.likes.push(userId);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('POST /api/posts/:id/like Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Дизлайк поста
const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id;
    if (post.likes.includes(userId)) post.likes.pull(userId);
    if (!post.dislikes.includes(userId)) post.dislikes.push(userId);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('POST /api/posts/:id/dislike Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Отримати статистику поста
const getPostStats = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const stats = {
      comments: post.comments.length,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
    };
    res.json(stats);
  } catch (err) {
    console.error('GET /api/posts/:id/stats Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримати список лайків (тільки для адмінів)
const getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('likes', 'firstName lastName email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post.likes);
  } catch (err) {
    console.error('GET /api/posts/:id/likes Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};