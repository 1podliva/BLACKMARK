import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfDay, addDays, parse } from 'date-fns';
import './BookingManagement.css';

const BookingManagement = ({ bookings, setBookings, handleSubmit, setError, setSuccess, fetchBookings }) => {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    user: '',
    artist: '',
    date: '',
    time: '',
    description: '',
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchArtists();
  }, [fetchBookings]);

  useEffect(() => {
    if (bookingForm.artist) {
      fetchAvailableDates(bookingForm.artist);
    } else {
      setAvailableDates([]);
      setAvailableTimes([]);
      setFormError('');
    }
  }, [bookingForm.artist]);

  useEffect(() => {
    if (bookingForm.artist && bookingForm.date) {
      console.log('Triggering fetchAvailableTimes for artist:', bookingForm.artist, 'date:', bookingForm.date);
      fetchAvailableTimes(bookingForm.artist, bookingForm.date);
    } else {
      console.log('Resetting availableTimes: no artist or date');
      setAvailableTimes([]);
      setFormError('');
    }
  }, [bookingForm.date, bookingForm.artist]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/artists');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setArtists(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAvailableTimes = async (artistId, date) => {
    try {
      console.log(`Sending request to fetch available times for artist: ${artistId}, date: ${date}`);
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('fetchAvailableTimes response:', data);
      if (!res.ok) {
        console.error('fetchAvailableTimes error:', data.message);
        throw new Error(data.message);
      }
      const times = data.availableTimes || [];
      console.log('Setting availableTimes:', times);
      setAvailableTimes(times);
      if (times.length === 0) {
        setFormError('Немає доступних слотів на цю дату');
        setTimeout(() => setFormError(''), 5000);
      } else {
        setFormError('');
      }
    } catch (err) {
      console.error('Error in fetchAvailableTimes:', err.message);
      setFormError(`Помилка при отриманні часу: ${err.message}`);
      setTimeout(() => setFormError(''), 5000);
      setAvailableTimes([]);
    }
  };

  const fetchAvailableDates = async (artistId) => {
    setIsLoading(true);
    setFormError('');
    try {
      console.log(`Fetching available dates for artist: ${artistId}`);
      const today = startOfDay(new Date());
      const endDate = addDays(today, 30);
      const dates = [];
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        console.log(`Checking availability for date: ${dateStr}`);
        const res = await fetch(
          `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${dateStr}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        const data = await res.json();
        console.log(`fetchAvailableDates response for ${dateStr}:`, data);
        if (!res.ok) {
          console.error(`Error for ${dateStr}: ${data.message}`);
          continue;
        }
        if (data.availableTimes && data.availableTimes.length > 0) {
          dates.push(dateStr);
        }
      }
      setAvailableDates(dates);
      setFormError('');
    } catch (err) {
      console.error('Error in fetchAvailableDates:', err.message);
      setFormError(`Помилка при отриманні дат: ${err.message}`);
      setTimeout(() => setFormError(''), 5000);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    const selectedDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
    const minBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (selectedDateTime < minBookingTime) {
      setFormError('Бронювання можливе щонайменше за 24 години');
      setTimeout(() => setFormError(''), 5000);
      return;
    }

    try {
      await handleSubmit('http://localhost:5000/api/bookings', 'POST', bookingForm);
      setSuccess('Бронювання створено!');
      setBookingForm({ user: '', artist: '', date: '', time: '', description: '' });
      setAvailableTimes([]);
      setAvailableDates([]);
      fetchBookings();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handleDateChange = (date) => {
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    console.log('Selected date:', formattedDate);
    console.log('Calendar value before update:', bookingForm.date);
    setBookingForm({ ...bookingForm, date: formattedDate, time: '' });
  };

  const isDateDisabled = ({ date }) => {
    if (!bookingForm.artist) return true;
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    return !availableDates.includes(formattedDate);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    if (availableDates.includes(formattedDate)) {
      return 'available-date';
    }
    return null;
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це бронювання?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${id}`, 'DELETE');
      setSuccess('Бронювання видалено!');
      fetchBookings();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${id}/status`, 'PUT', { status });
      setSuccess(`Статус оновлено до ${status}!`);
      fetchBookings();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  return (
    <div className="booking-management">
      <h3>Керування бронюваннями</h3>

      <h4>Створити бронювання</h4>
      {formError && <p className="error-message">{formError}</p>}
      {isLoading && <p className="info-message">Завантаження доступних дат...</p>}
      <form onSubmit={handleBookingSubmit}>
        <div className="form-group">
          <label>Клієнт</label>
          <select
            value={bookingForm.user}
            onChange={(e) => setBookingForm({ ...bookingForm, user: e.target.value })}
            required
          >
            <option value="">Виберіть клієнта</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Майстер</label>
          <select
            value={bookingForm.artist}
            onChange={(e) => setBookingForm({ ...bookingForm, artist: e.target.value, date: '', time: '' })}
            required
          >
            <option value="">Виберіть майстра</option>
            {artists.map((artist) => (
              <option key={artist._id} value={artist._id}>{artist.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Дата</label>
          <Calendar
            onChange={handleDateChange}
            value={bookingForm.date ? parse(bookingForm.date, 'yyyy-MM-dd', new Date()) : startOfDay(new Date())}
            minDate={addDays(new Date(), 1)}
            tileDisabled={isDateDisabled}
            tileClassName={tileClassName}
          />
        </div>
        <div className="form-group">
          <label>Час</label>
          <select
            value={bookingForm.time}
            onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
            required
            disabled={!bookingForm.date || availableTimes.length === 0}
          >
            <option value="">Виберіть час</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {!bookingForm.date && <p className="info-message">Спочатку виберіть дату</p>}
          {bookingForm.date && availableTimes.length === 0 && (
            <p className="error-message">Немає доступних слотів на цю дату</p>
          )}
        </div>
        <div className="form-group">
          <label>Опис</label>
          <textarea
            value={bookingForm.description}
            onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="submit-btn"
          disabled={!bookingForm.user || !bookingForm.artist || !bookingForm.date || !bookingForm.time}
        >
          Створити бронювання
        </button>
      </form>

      <h4>Усі бронювання</h4>
      <div className="bookings-list">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="booking-item">
              <span>
                Клієнт: {booking.user?.firstName} {booking.user?.lastName || 'Невідомий'},
                Майстер: {booking.artist?.name || 'Невідомий'},
                Дата: {new Date(booking.date).toLocaleDateString()},
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
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    className="submit-btn"
                    onClick={() => handleUpdateStatus(booking._id, 'completed')}
                  >
                    Завершено
                  </button>
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