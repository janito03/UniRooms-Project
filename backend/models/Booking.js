const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'overridden'],
    default: 'confirmed'
  },
  overriddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Indexes for fast conflict checking
bookingSchema.index({ room_id: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user_id: 1, startTime: -1 });

module.exports = mongoose.model('Booking', bookingSchema);