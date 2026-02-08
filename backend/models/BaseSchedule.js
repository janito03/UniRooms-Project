const mongoose = require('mongoose');

const baseScheduleSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('BaseSchedule', baseScheduleSchema);