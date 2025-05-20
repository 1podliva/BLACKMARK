const Notification = require('../models/Notification');
const User = require('../models/User');

// Створити та надіслати повідомлення
const sendNotification = async (io, message, details, userId, relatedDoc, type) => {
  try {
    const notification = {
      message,
      details,
      user: userId,
      [type]: relatedDoc._id,
      read: false,
    };
    const savedNotification = await new Notification(notification).save();

    io.to(userId.toString()).emit('newNotification', {
      ...savedNotification._doc,
      [type]: { ...relatedDoc._doc, artist: { name: relatedDoc.artist.name }, type },
    });

    return savedNotification;
  } catch (err) {
    console.error('Error sending notification:', err);
    throw err;
  }
};

// Надіслати повідомлення всім адмінам
const notifyAdmins = async (io, message, details, relatedDoc, type) => {
  const admins = await User.find({ role: 'admin' });
  if (admins.length === 0) {
    throw new Error('Адміністратори не знайдені');
  }

  for (const admin of admins) {
    await sendNotification(io, message, details, admin._id, relatedDoc, type);
  }
};

module.exports = { sendNotification, notifyAdmins };