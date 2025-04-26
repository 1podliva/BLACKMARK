const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Додаємо роль
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);