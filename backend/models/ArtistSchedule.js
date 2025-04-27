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
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Валідація формату HH:MM
  },
  endTime: {
    type: String, // Наприклад, "14:00"
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Валідація формату HH:MM
  },
});

// Унікальний індекс для уникнення дублювання
artistScheduleSchema.index({ artist: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('ArtistSchedule', artistScheduleSchema);