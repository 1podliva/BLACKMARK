const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: false },
  category: { 
    type: String, 
    required: true,
    validate: {
      validator: async function(value) {
        const category = await mongoose.model('Category').findOne({ name: value });
        return !!category;
      },
      message: 'Category does not exist'
    }
  },
  featured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);