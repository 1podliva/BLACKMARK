const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Імпорт роутів
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const galleryRoutes = require('./routes/gallery');
const galleryCategoryRoutes = require('./routes/gallery-categories');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const artistRoutes = require('./routes/artists');
const notificationRoutes = require('./routes/notifications');
const artistSchedules = require('./routes/artistSchedules');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
console.log('Registering routes...');
app.use('/api/posts', postRoutes);
console.log('postRoutes registered');
app.use('/api/categories', categoryRoutes);
console.log('categoryRoutes registered');
app.use('/api/gallery', galleryRoutes);
console.log('galleryRoutes registered');
app.use('/api/gallery-categories', galleryCategoryRoutes);
console.log('galleryCategoryRoutes registered');
app.use('/api/auth', authRoutes);
console.log('authRoutes registered');
app.use('/api/users', userRoutes);
console.log('userRoutes registered');
app.use('/api/bookings', bookingRoutes);
console.log('bookingRoutes registered');
app.use('/api/artists', artistRoutes);
console.log('artistRoutes registered');
app.use('/api/notifications', notificationRoutes);
console.log('notificationRoutes registered');
app.use('/api/artist-schedules', artistSchedules);
console.log('artist-schedules registered');
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));