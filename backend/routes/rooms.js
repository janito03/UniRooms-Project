const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { authenticate, isAdmin } = require('../middleware/auth');

// GET all rooms (anyone logged in can see)
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, capacity } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { roomNumber, capacity, type, features } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = new Room({
      roomNumber,
      capacity,
      type,
      features: features || []
    });

    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:roomId', authenticate, isAdmin, async (req, res) => {
  try {
    const { roomNumber, capacity, type, features } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { roomNumber, capacity, type, features },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:roomId', authenticate, isAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;