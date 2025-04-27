const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  description: {
    type: String,
    default: 'Консультація',
  },
  preferredDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Consultation', consultationSchema);