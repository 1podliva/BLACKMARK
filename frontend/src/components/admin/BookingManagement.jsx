import React from 'react';

const BookingManagement = ({ bookings, setBookings, handleSubmit, setError, setSuccess, fetchBookings }) => {
  const handleStatusChange = async (bookingId, status) => {
    try {
      const data = await handleSubmit(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        'PUT',
        { status }
      );
      setBookings(bookings.map((b) => (b._id === bookingId ? data : b)));
      setSuccess('Статус оновлено!');
    } catch (err) {
      // Помилка вже оброблена в handleSubmit
    }
  };

  return (
    <div className="booking-management">
      <h3>Керування бронюваннями</h3>
      {bookings.length > 0 ? (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Користувач</th>
              <th>Майстер</th>
              <th>Дата</th>
              <th>Час</th>
              <th>Опис</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Невідомо'}</td>
                <td>{booking.artist}</td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.time}</td>
                <td>{booking.description || 'Немає'}</td>
                <td>{booking.status}</td>
                <td>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  >
                    <option value="pending">Очікує</option>
                    <option value="confirmed">Підтверджено</option>
                    <option value="cancelled">Скасовано</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Бронювань немає</p>
      )}
    </div>
  );
};

export default BookingManagement;