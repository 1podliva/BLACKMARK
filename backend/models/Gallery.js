const mongoose = require('mongoose');
const gallerySchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  styles: [{ type: String, required: true }],
  style: { type: String } // Legacy field for backward compatibility
});
module.exports = mongoose.model('Gallery', gallerySchema);