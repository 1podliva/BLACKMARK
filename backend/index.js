const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { scheduleStatusUpdates } = require('./cronJobs');

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all necessary methods
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// WebSocket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token || !token.startsWith('Bearer ')) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your_jwt_secret');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});

// Зберігаємо io для використання в маршрутах
app.set('io', io);

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

// Start the cron job for status updates
scheduleStatusUpdates(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));