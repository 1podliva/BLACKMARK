const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Отримати всі сповіщення для адміна
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('GET /api/notifications Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Позначити сповіщення як прочитане
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Сповіщення не знайдено' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('PUT /api/notifications/:id/read Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Новий маршрут для обробки відправки форми контактів
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Валідація даних
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    // Створити нове сповіщення без зв’язку з користувачем
    const notification = new Notification({
      message: `Нове повідомлення від ${name} (${email})`,
      details: message,
      read: false,
    });

    await notification.save();
    res.status(201).json({ message: 'Повідомлення успішно відправлено' });
  } catch (err) {
    console.error('POST /api/notifications/contact Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;