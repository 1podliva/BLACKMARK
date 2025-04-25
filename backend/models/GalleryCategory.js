const mongoose = require('mongoose');
const galleryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('GalleryCategory', galleryCategorySchema);