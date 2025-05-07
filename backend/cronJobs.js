const cron = require('node-cron');
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Consultation = require('./models/Consultation');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Function to update statuses of bookings and consultations
const updateStatuses = async (io) => {
  try {
    const now = new Date();

    // Update Bookings
    const bookingsToUpdate = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      date: { $lte: now },
    }).populate('user', 'firstName lastName').populate('artist', 'name');

    for (const booking of bookingsToUpdate) {
      // Parse the booking date and time
      const bookingDateTime = new Date(booking.date);
      const [hours, minutes] = booking.time.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      // Check if the booking time has passed (considering the session duration, e.g., 1 hour)
      const sessionDuration = 60 * 60 * 1000; // 1 hour in milliseconds
      const bookingEndTime = new Date(bookingDateTime.getTime() + sessionDuration);

      if (now >= bookingEndTime) {
        booking.status = 'completed';
        await booking.save();

        // Notify the user
        const userNotification = new Notification({
          message: `Ваше бронювання з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time} завершено`,
          details: `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}`,
          user: booking.user._id,
          booking: booking._id,
          read: false,
        });
        const savedUserNotification = await userNotification.save();

        // Emit notification via Socket.IO
        io.to(booking.user._id.toString()).emit('newNotification', {
          ...savedUserNotification._doc,
          booking: { ...booking._doc, artist: { name: booking.artist.name }, type: 'booking' },
        });

        // Notify admins
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
          const adminNotification = new Notification({
            message: `Бронювання користувача ${booking.user.firstName} ${booking.user.lastName} з ${booking.artist.name} на ${new Date(booking.date).toLocaleDateString('uk-UA')} о ${booking.time} завершено`,
            details: `Дата: ${new Date(booking.date).toLocaleDateString('uk-UA')}, Час: ${booking.time}`,
            user: admins[0]._id,
            booking: booking._id,
            read: false,
          });
          const savedAdminNotification = await adminNotification.save();

          admins.forEach((admin) => {
            io.to(admin._id.toString()).emit('newNotification', {
              ...savedAdminNotification._doc,
              booking: { ...booking._doc, artist: { name: booking.artist.name }, type: 'booking' },
            });
          });
        }
      }
    }

    // Update Consultations
    const consultationsToUpdate = await Consultation.find({
      status: { $in: ['pending', 'reviewed'] },
      preferredDate: { $lte: now },
    }).populate('user', 'firstName lastName').populate('artist', 'name');

    for (const consultation of consultationsToUpdate) {
      // Parse the consultation date and time
      const consultationDateTime = new Date(consultation.preferredDate);
      const [hours, minutes] = consultation.time.split(':').map(Number);
      consultationDateTime.setHours(hours, minutes, 0, 0);

      // Check if the consultation time has passed (considering the session duration, e.g., 30 minutes)
      const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      const consultationEndTime = new Date(consultationDateTime.getTime() + sessionDuration);

      if (now >= consultationEndTime) {
        consultation.status = 'completed';
        await consultation.save();

        // Notify the user
        const userNotification = new Notification({
          message: `Ваша консультація з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time} завершена`,
          details: `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}`,
          user: consultation.user._id,
          consultation: consultation._id,
          read: false,
        });
        const savedUserNotification = await userNotification.save();

        // Emit notification via Socket.IO
        io.to(consultation.user._id.toString()).emit('newNotification', {
          ...savedUserNotification._doc,
          consultation: { ...consultation._doc, artist: { name: consultation.artist.name }, type: 'consultation' },
        });

        // Notify admins
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
          const adminNotification = new Notification({
            message: `Консультація користувача ${consultation.user.firstName} ${consultation.user.lastName} з ${consultation.artist.name} на ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')} о ${consultation.time} завершена`,
            details: `Дата: ${new Date(consultation.preferredDate).toLocaleDateString('uk-UA')}, Час: ${consultation.time}`,
            user: admins[0]._id,
            consultation: consultation._id,
            read: false,
          });
          const savedAdminNotification = await adminNotification.save();

          admins.forEach((admin) => {
            io.to(admin._id.toString()).emit('newNotification', {
              ...savedAdminNotification._doc,
              consultation: { ...consultation._doc, artist: { name: consultation.artist.name }, type: 'consultation' },
            });
          });
        }
      }
    }
  } catch (err) {
    console.error('Error updating statuses via cron:', err);
  }
};

// Schedule the job to run every minute
const scheduleStatusUpdates = (io) => {
  cron.schedule('* * * * *', () => {
    console.log('Running status update cron job...');
    updateStatuses(io);
  });
};

module.exports = { scheduleStatusUpdates };