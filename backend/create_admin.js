const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const username = 'admin';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    console.log('Admin user created');
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();