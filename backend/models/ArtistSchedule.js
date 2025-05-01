const mongoose = require('mongoose');

const artistScheduleSchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
});

// Унікальний індекс на artist і date
artistScheduleSchema.index({ artist: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ArtistSchedule', artistScheduleSchema);