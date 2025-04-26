import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Profile.css';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', avatar: null });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [bookingForm, setBookingForm] = useState({ artist: '', date: '', time: '', description: '' });
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const allTimeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName, lastName: user.lastName, avatar: null });
      fetchBookings();
      fetchArtists();
    }
  }, [user]);

  useEffect(() => {
    if (bookingForm.artist && bookingForm.date) {
      fetchAvailableTimes(bookingForm.artist, bookingForm.date);
    } else {
      setAvailableTimes([]);
    }
  }, [bookingForm.artist, bookingForm.date]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBookings(data);
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

  const fetchAvailableTimes = async (artist, date) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${encodeURIComponent(artist)}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const bookedTimes = data.bookedTimes || [];
      const available = allTimeSlots.filter((time) => !bookedTimes.includes(time));
      setAvailableTimes(available);
    } catch (err) {
      setError(err.message);
      setAvailableTimes([]);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName);
      formData.append('lastName', profileForm.lastName);
      if (profileForm.avatar) formData.append('avatar', profileForm.avatar);

      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Профіль оновлено!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('Нові паролі не співпадають');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Пароль оновлено!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валідація: бронювання мінімум за 24 години
    const selectedDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
    const minBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 години
    if (selectedDateTime < minBookingTime) {
      setError('Бронювання можливе щонайменше за 24 години');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bookingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Бронювання створено!');
      setBookingForm({ artist: '', date: '', time: '', description: '' });
      fetchBookings();
      setAvailableTimes([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setBookingForm({ ...bookingForm, date: formattedDate, time: '' });
  };

  const isDateDisabled = ({ date }) => {
    if (!bookingForm.artist) return false;
    const formattedDate = date.toISOString().split('T')[0];
    return availableTimes.length === 0 && bookingForm.date === formattedDate;
  };

  const handleLogout = () => {
    logout();
  };

  if (!user || !token) {
    navigate('/');
    return null;
  }

  return (
    <section className="profile-section" id="profile">
      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Особисті дані
          </button>
          <button
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Безпека
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Бронювання
          </button>
          {user.role === 'admin' && (
            <button
              className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              Адмін-панель
            </button>
          )}
          <button className="tab logout" onClick={handleLogout}>
            Вийти
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {activeTab === 'personal' && (
          <div className="profile-details">
            <h3>Особисті дані</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Ім’я</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Прізвище</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="form-group">
                <label>Аватарка</label>
                {user.avatar && (
                  <img
                    src={`http://localhost:5000${user.avatar}`}
                    alt="Avatar"
                    className="avatar-preview"
                    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.files[0] })}
                />
              </div>
              <button type="submit" className="submit-btn">Зберегти</button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-details">
            <h3>Безпека</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Старий пароль</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Новий пароль</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Підтвердження нового пароля</label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Змінити пароль</button>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="profile-details">
            <h3>Нове бронювання</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Майстер</label>
                <select
                  value={bookingForm.artist}
                  onChange={(e) => setBookingForm({ ...bookingForm, artist: e.target.value, time: '' })}
                  required
                >
                  <option value="">Виберіть майстра</option>
                  {artists.map((artist) => (
                    <option key={artist._id} value={artist.name}>{artist.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Дата</label>
                <Calendar
                  onChange={handleDateChange}
                  value={bookingForm.date ? new Date(bookingForm.date) : new Date()}
                  minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Мінімум через 24 години
                  tileDisabled={isDateDisabled}
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
                <label>Опис (ідея татуювання)</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={!bookingForm.artist || !bookingForm.date || !bookingForm.time}
              >
                Забронювати
              </button>
            </form>

            <h3>Історія бронювань</h3>
            {bookings.length > 0 ? (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Майстер</th>
                    <th>Дата</th>
                    <th>Час</th>
                    <th>Опис</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.artist}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.time}</td>
                      <td>{booking.description || 'Немає'}</td>
                      <td>{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Бронювань немає</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;