const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  style: { type: String, required: true }, // e.g., Traditional, Realism, Japanese
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);