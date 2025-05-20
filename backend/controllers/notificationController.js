const Notification = require('../models/Notification');

// Отримати всі сповіщення
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('GET /api/notifications Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Позначити сповіщення як прочитане
const markNotificationAsRead = async (req, res) => {
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
};

// Обробка відправки форми контактів
const handleContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

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
};

module.exports = {
  getAllNotifications,
  markNotificationAsRead,
  handleContactForm,
};