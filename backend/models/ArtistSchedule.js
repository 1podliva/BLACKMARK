const mongoose = require('mongoose');

const artistScheduleSchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  dayOfWeek: {
    type: Number, // 0 = Неділя, 1 = Понеділок, ..., 6 = Субота
    min: 0,
    max: 6,
    required: true,
  },
  startTime: {
    type: String, // Наприклад, "10:00"
    required: true,
  },
  endTime: {
    type: String, // Наприклад, "14:00"
    required: true,
  },
});

module.exports = mongoose.model('ArtistSchedule', artistScheduleSchema);