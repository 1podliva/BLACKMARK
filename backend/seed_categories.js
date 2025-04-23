const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const categories = [
      'Часті запитання',
      'Битовуха з тату',
      'Поради та догляд',
      'Історії клієнтів',
    ];

    await Category.deleteMany({});
    await Category.insertMany(categories.map(name => ({ name })));
    console.log('Categories seeded');
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedCategories();