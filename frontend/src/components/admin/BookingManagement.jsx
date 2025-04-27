import React, { useEffect } from 'react';
// import './BookingManagement.css';
const BookingManagement = ({ bookings, setBookings, handleSubmit, setError, setSuccess, fetchBookings }) => {
  useEffect(() => {
    fetchBookings(); // Оновлюємо список при монтажі компонента
  }, [fetchBookings]);

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це бронювання?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${id}`, 'DELETE');
      setSuccess('Бронювання видалено!');
      fetchBookings(); // Оновлюємо список після видалення
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${id}/status`, 'PUT', { status });
      setSuccess(`Статус оновлено до ${status}!`);
      fetchBookings(); // Оновлюємо список після зміни статусу
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  return (
    <div className="booking-management">
      <h3>Керування бронюваннями</h3>
      <div className="bookings-list">
        <h4>Усі бронювання</h4>
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="booking-item">
              <span>
                Клієнт: {booking.user?.firstName} {booking.user?.lastName || 'Невідомий'}, 
                Майстер: {booking.artist?.name || 'Невідомий'}, 
                Дата: {booking.date}, 
                Час: {booking.time}, 
                Статус: {booking.status}
              </span>
              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <>
                    <button
                      className="submit-btn"
                      onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                    >
                      Підтвердити
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                    >
                      Скасувати
                    </button>
                  </>
                )}
                <button className="delete-btn" onClick={() => handleDeleteBooking(booking._id)}>
                  Видалити
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Бронювання відсутні</p>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;