const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');  

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);  

app.get('/', (req, res) => {
  res.json({ 
    message: 'UniRoom API is Running!',
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      rooms: '/api/rooms' 
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});