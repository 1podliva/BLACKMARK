const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    // Якщо middleware auth пройшов, токен валідний
    res.json({ message: 'Token is valid' });
  } catch (err) {
    console.error('GET /api/auth/verify Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;