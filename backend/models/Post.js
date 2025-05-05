const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }, // New field to track if comment was edited
});

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
  comments: [commentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Post', postSchema);