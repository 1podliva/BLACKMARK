const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  age: { type: Number, required: true },
  experience: { type: String, required: true },
  photo_url: { type: String }, // Зроблено необов’язковим
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artist', artistSchema);