const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const restrictToAdmin = require('../middleware/restrictToAdmin');

// Отримати всі сповіщення для адміна
router.get('/', auth, restrictToAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('booking', 'artist date time')
      .populate('consultation', 'artist preferredDate time')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('GET /api/notifications Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Позначити сповіщення як прочитане
router.put('/:id/read', auth, restrictToAdmin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Сповіщення не знайдено' });
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('PUT /api/notifications/:id/read Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;