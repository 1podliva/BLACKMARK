use blackmark

const migrateSchedules = async () => {
  const schedules = await db.artistschedules.find().toArray();
  const startDate = new Date('2025-05-01');
  const weeks = 4;

  print('Found schedules:', schedules.length);

  for (const schedule of schedules) {
    if (schedule.dayOfWeek !== undefined) {
      const { artist, dayOfWeek, startTime, endTime } = schedule;

      // Видаляємо старий графік
      await db.artistschedules.deleteOne({ _id: schedule._id });

      // Створюємо нові графіки
      for (let i = 0; i < weeks * 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);
        if (date.getDay() === dayOfWeek) {
          await db.artistschedules.insertOne({
            artist,
            date,
            startTime,
            endTime,
            createdAt: new Date(),
          });
          print(`Created schedule for ${date.toISOString().split('T')[0]}`);
        }
      }
    }
  }
  print('Міграція завершена!');
};

migrateSchedules();