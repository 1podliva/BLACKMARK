const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Отримати список всіх користувачів (тільки для адмінів)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName');
    res.json(users);
  } catch (err) {
    console.error('GET /api/users Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримати профіль
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/users/profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Оновити профіль
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    if (req.file) {
      user.avatar = `/images/avatars/${req.file.filename}`;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('PUT /api/users/profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Змінити пароль
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('PUT /api/users/password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword,
};