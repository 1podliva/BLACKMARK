
import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfDay, addDays, parse } from 'date-fns';
import { toast } from 'react-toastify';
import { FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const BookingManagement = ({ mode, bookings, setBookings, handleSubmit, setError, setSuccess, fetchBookings }) => {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    user: '',
    artist: '',
    date: '',
    time: '',
    description: '',
  });
  const [editingBooking, setEditingBooking] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef(null);

  // Мапінг статусів
  const bookingStatusMap = {
    pending: { label: 'Очікує', color: '#F59E0B' },
    confirmed: { label: 'Підтверджено', color: '#2ECC71' },
    cancelled: { label: 'Скасовано', color: '#EF4444' },
    completed: { label: 'Завершено', color: '#3B82F6' },
  };

  const consultationStatusMap = {
    pending: { label: 'Очікує', color: '#F59E0B' },
    reviewed: { label: 'Переглянуто', color: '#2ECC71' },
    cancelled: { label: 'Скасовано', color: '#EF4444' },
  };

  // Ініціалізація WebSocket
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.event === 'date-selection-required') {
          toast.info(data.message, { className: 'admin-toast' });
        }

        if (data.event === 'no-available-slots') {
          toast.error(data.message, { className: 'admin-toast' });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
        toast.error('Помилка обробки повідомлення', { className: 'admin-toast' });
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Помилка з’єднання з WebSocket', { className: 'admin-toast' });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchArtists();
    fetchConsultations();
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
      fetchAvailableTimes(bookingForm.artist, bookingForm.date);
      // Відправка події для перевірки доступних слотів
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: 'check-available-slots',
            artistId: bookingForm.artist,
            date: bookingForm.date,
          })
        );
      }
    } else {
      setAvailableTimes([]);
      setFormError('');
      // Відправка події для перевірки вибору дати
      if (ws.current && ws.current.readyState === WebSocket.OPEN && !bookingForm.date) {
        ws.current.send(
          JSON.stringify({
            event: 'date-selection-required',
            message: 'Спочатку виберіть дату',
          })
        );
      }
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
      const res = await fetch('http://localhost:5000/api/artists', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setArtists(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchConsultations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings/consultations/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setConsultations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAvailableTimes = async (artistId, date) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const times = data.availableTimes || [];
      setAvailableTimes(times);
      if (times.length === 0 && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: 'no-available-slots',
            message: 'Немає доступних слотів',
          })
        );
      }
    } catch (err) {
      setFormError(`Помилка при отриманні часу: ${err.message}`);
      setTimeout(() => setFormError(''), 5000);
      setAvailableTimes([]);
    }
  };

  const fetchAvailableDates = async (artistId) => {
    setIsLoading(true);
    setFormError('');
    try {
      const today = startOfDay(new Date());
      const endDate = addDays(today, 30);
      const dates = [];
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        const res = await fetch(
          `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${dateStr}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        const data = await res.json();
        if (!res.ok) continue;
        if (data.availableTimes && data.availableTimes.length > 0) {
          dates.push(dateStr);
        }
      }
      setAvailableDates(dates);
      setFormError('');
    } catch (err) {
      setFormError(`Помилка при отриманні дат: ${err.message}`);
      setTimeout(() => setFormError(''), 5000);
    } finally {
      setIsLoading(false);
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
      toast.success('Бронювання створено!', { className: 'admin-toast' });
      setBookingForm({ user: '', artist: '', date: '', time: '', description: '' });
      setAvailableTimes([]);
      setAvailableDates([]);
      fetchBookings();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const handleEditBookingSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${editingBooking._id}`, 'PUT', bookingForm);
      toast.success('Бронювання оновлено!', { className: 'admin-toast' });
      setEditingBooking(null);
      setBookingForm({ user: '', artist: '', date: '', time: '', description: '' });
      setAvailableTimes([]);
      setAvailableDates([]);
      fetchBookings();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const handleDateChange = (date) => {
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
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
      toast.success('Бронювання видалено!', { className: 'admin-toast' });
      fetchBookings();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/${id}/status`, 'PUT', { status });
      toast.success(`Статус оновлено до "${bookingStatusMap[status].label}"!`, { className: 'admin-toast' });
      fetchBookings();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const handleDeleteConsultation = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю консультацію?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/consultations/${id}`, 'DELETE');
      toast.success('Консультацію видалено!', { className: 'admin-toast' });
      fetchConsultations();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const handleUpdateConsultationStatus = async (id, status) => {
    try {
      await handleSubmit(`http://localhost:5000/api/bookings/consultations/${id}/status`, 'PUT', { status });
      toast.success(`Статус оновлено до "${consultationStatusMap[status].label}"!`, { className: 'admin-toast' });
      fetchConsultations();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast' });
    }
  };

  const startEditingBooking = (booking) => {
    setEditingBooking(booking);
    setBookingForm({
      user: booking.user?._id || '',
      artist: booking.artist?._id || '',
      date: booking.date.split('T')[0],
      time: booking.time,
      description: booking.description || '',
    });
  };

  if (mode === 'add') {
    return (
      <div className="booking-management">
        <h3>{editingBooking ? 'Редагувати бронювання' : 'Додати бронювання'}</h3>
        {formError && <p className="error-message">{formError}</p>}
        {isLoading && <p className="info-message">Завантаження доступних дат...</p>}
        <form onSubmit={editingBooking ? handleEditBookingSubmit : handleBookingSubmit} className="booking-form">
          <div className="form-grid">
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
            </div>
            <div className="form-group full-width">
              <label>Опис</label>
              <textarea
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                placeholder="Опишіть деталі бронювання"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={!bookingForm.user || !bookingForm.artist || !bookingForm.date || !bookingForm.time}
            >
              {editingBooking ? 'Зберегти' : 'Створити'}
            </button>
            {editingBooking && (
              <button type="button" className="cancel-btn" onClick={() => setEditingBooking(null)}>
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="booking-management">
        <h3>Редагувати бронювання</h3>
        {editingBooking ? (
          <form onSubmit={handleEditBookingSubmit} className="booking-form">
            <div className="form-grid">
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
              </div>
              <div className="form-group full-width">
                <label>Опис</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  placeholder="Опишіть деталі бронювання"
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={!bookingForm.user || !bookingForm.artist || !bookingForm.date || !bookingForm.time}
              >
                Зберегти
              </button>
              <button type="button" className="cancel-btn" onClick={() => setEditingBooking(null)}>
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <>
            <h4>Усі бронювання</h4>
            <div className="table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Клієнт</th>
                    <th>Майстер</th>
                    <th>Дата</th>
                    <th>Час</th>
                    <th>Статус</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.user?.firstName} {booking.user?.lastName || 'Невідомий'}</td>
                        <td>{booking.artist?.name || 'Невідомий'}</td>
                        <td>{new Date(booking.date).toLocaleDateString()}</td>
                        <td>{booking.time}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: bookingStatusMap[booking.status]?.color || '#6B7280' }}
                          >
                            {bookingStatusMap[booking.status]?.label || booking.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => startEditingBooking(booking)}
                              title="Редагувати"
                            >
                              <FaEdit />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn confirm"
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                  title="Підтвердити"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="action-btn cancel"
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                  title="Скасувати"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button
                                className="action-btn complete"
                                onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                                title="Завершено"
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteBooking(booking._id)}
                              title="Видалити"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">Бронювання відсутні</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <h4>Усі консультації</h4>
            <div className="table-wrapper">
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
                  {consultations && consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <tr key={consultation._id}>
                        <td>{consultation.user?.firstName} {consultation.user?.lastName || 'Невідомий'}</td>
                        <td>{consultation.artist?.name || 'Невідомий'}</td>
                        <td>{new Date(consultation.preferredDate).toLocaleDateString()}</td>
                        <td>{consultation.time}</td>
                        <td>{consultation.description || 'Немає'}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: consultationStatusMap[consultation.status]?.color || '#6B7280' }}
                          >
                            {consultationStatusMap[consultation.status]?.label || consultation.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {consultation.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn confirm"
                                  onClick={() => handleUpdateConsultationStatus(consultation._id, 'reviewed')}
                                  title="Переглянуто"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="action-btn cancel"
                                  onClick={() => handleUpdateConsultationStatus(consultation._id, 'cancelled')}
                                  title="Скасувати"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteConsultation(consultation._id)}
                              title="Видалити"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">Консультації відсутні</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default BookingManagement;
