import React, { useState } from 'react';


const BookingManagement = ({ bookings, setBookings, handleSubmit, setError, setSuccess, fetchBookings }) => {
  const [statusForm, setStatusForm] = useState({ id: '', status: '', comment: '' });

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await handleSubmit(
        `http://localhost:5000/api/bookings/${statusForm.id}`,
        'PUT',
        { status: statusForm.status, comment: statusForm.comment }
      );
      setSuccess('Статус оновлено!');
      setStatusForm({ id: '', status: '', comment: '' });
      fetchBookings();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  return (
    <div className="booking-management">
      <h3>Керування бронюваннями</h3>
      {bookings.length > 0 ? (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Клієнт</th>
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
                <td>{`${booking.userId.firstName} ${booking.userId.lastName}`}</td>
                <td>{booking.artist}</td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.time}</td>
                <td>{booking.description || 'Немає'}</td>
                <td>{booking.status}</td>
                <td>
                  <button
                    onClick={() =>
                      setStatusForm({ id: booking._id, status: booking.status, comment: '' })
                    }
                  >
                    Оновити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Бронювань немає</p>
      )}

      {statusForm.id && (
        <form onSubmit={handleStatusSubmit} className="admin-form">
          <h4>Оновити статус бронювання</h4>
          <div className="form-group">
            <label>Статус</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              required
            >
              <option value="pending">Очікує</option>
              <option value="confirmed">Підтверджено</option>
              <option value="cancelled">Скасовано</option>
            </select>
          </div>
          <div className="form-group">
            <label>Коментар</label>
            <textarea
              value={statusForm.comment}
              onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
            />
          </div>
          <button type="submit" className="submit-btn">
            Зберегти
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setStatusForm({ id: '', status: '', comment: '' })}
          >
            Скасувати
          </button>
        </form>
      )}
    </div>
  );
};

export default BookingManagement;