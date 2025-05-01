const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blackmark', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', async () => {
  try {
    // Перевіряємо, чи існує індекс
    const indexes = await db.collection('artistschedules').getIndexes();
    const oldIndexExists = indexes.some((index) => index.name === 'artist_1_dayOfWeek_1');

    if (oldIndexExists) {
      await db.collection('artistschedules').dropIndex('artist_1_dayOfWeek_1');
      console.log('Old index "artist_1_dayOfWeek_1" dropped successfully');
    } else {
      console.log('Old index "artist_1_dayOfWeek_1" does not exist');
    }

    // Переконуємося, що новий індекс створений
    await db.collection('artistschedules').createIndex(
      { artist: 1, date: 1 },
      { unique: true }
    );
    console.log('New index "artist_1_date_1" created successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error during index migration:', err);
    process.exit(1);
  }
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});