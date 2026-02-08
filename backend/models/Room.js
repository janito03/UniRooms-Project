const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['normal', 'lab', 'lecture_hall', 'conference'],
    default: 'normal'
  },
  features: {
    type: [String],
    default: []
  }
});

// Index for fast searching
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ type: 1, capacity: 1 });

module.exports = mongoose.model('Room', roomSchema);