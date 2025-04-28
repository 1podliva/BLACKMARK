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
  const [consultationForm, setConsultationForm] = useState({ artist: '', preferredDate: '', time: '' });
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Перевіряємо авторизацію
  useEffect(() => {
    if (!user && !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  const statusTranslations = {
    pending: 'Очікує',
    confirmed: 'Підтверджено',
    completed: 'Завершено',
    cancelled: 'Скасовано',
    reviewed: 'Переглянуто',
  };

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName, lastName: user.lastName, avatar: null });
      fetchBookings();
      fetchArtists();
    }
  }, [user]);

  useEffect(() => {
    if (consultationForm.artist && consultationForm.preferredDate) {
      fetchAvailableTimes(consultationForm.artist, consultationForm.preferredDate);
    } else {
      setAvailableTimes([]);
    }
  }, [consultationForm.artist, consultationForm.preferredDate]);

  useEffect(() => {
    console.log('Bookings received:', bookings);
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      // Запит для бронювань
      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      console.log('Fetched bookings:', bookingsData);
      if (!bookingsRes.ok) throw new Error(bookingsData.message);

      // Запит для консультацій
      const consultationsRes = await fetch('http://localhost:5000/api/bookings/consultations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const consultationsData = await consultationsRes.json();
      console.log('Fetched consultations:', consultationsData);
      if (!consultationsRes.ok) throw new Error(consultationsData.message);

      // Об’єднуємо бронювання і консультації
      const combinedBookings = [
        ...bookingsData.map((b) => ({ ...b, type: 'booking' })),
        ...consultationsData.map((c) => ({
          ...c,
          type: 'consultation',
          date: c.preferredDate, // Для уніфікації з Booking
          description: c.description || 'Консультація',
        })),
      ];
      setBookings(combinedBookings);
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
      console.log('Fetching available times for:', { artistId, date });
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log('.DATA:', data);
      console.log('Availability response:', data);
      if (!res.ok) throw new Error(data.message || 'Помилка сервера');
      setAvailableTimes(data.availableTimes || []);
      if (!data.availableTimes || data.availableTimes.length === 0) {
        setError('Немає доступних слотів на цю дату');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('fetchAvailableTimes error:', err);
      setError(err.message);
      setAvailableTimes([]);
      setTimeout(() => setError(''), 5000);
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

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      console.log('Sending consultation request:', consultationForm);
      const res = await fetch('http://localhost:5000/api/bookings/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(consultationForm),
      });
      const data = await res.json();
      console.log('Consultation response:', data);
      if (!res.ok) throw new Error(data.message || 'Помилка сервера');
      setSuccess('Запит на консультацію відправлено!');
      const { artist, preferredDate } = consultationForm;
      setConsultationForm({ artist: '', preferredDate: '', time: '' });
      setAvailableTimes([]);
      // Оновлюємо історію і доступні слоти
      await fetchBookings();
      if (artist && preferredDate) {
        await fetchAvailableTimes(artist, preferredDate);
      }
    } catch (err) {
      console.error('Consultation error:', err);
      setError(err.message);
    }
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log('Selected date:', { raw: date, formatted: formattedDate });
    setConsultationForm({ ...consultationForm, preferredDate: formattedDate, time: '' });
  };

  const handleLogout = () => {
    logout();
  };

  // Показуємо лоадер, поки user не ініціалізовано
  if (user === null) {
    return <div className="loading">Завантаження...</div>;
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
          {user?.role === 'admin' && (
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
            <h3>Запит на консультацію</h3>
            <form onSubmit={handleConsultationSubmit}>
              <div className="form-group">
                <label>Майстер</label>
                <select
                  value={consultationForm.artist}
                  onChange={(e) => setConsultationForm({ ...consultationForm, artist: e.target.value, time: '' })}
                  required
                >
                  <option value="">Виберіть майстра</option>
                  {artists.map((artist) => (
                    <option key={artist._id} value={artist._id}>{artist.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Бажана дата</label>
                <Calendar
                  onChange={handleDateChange}
                  value={consultationForm.preferredDate ? new Date(consultationForm.preferredDate) : new Date()}
                  minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                  locale="uk-UA"
                  formatShortWeekday={(locale, date) =>
                    ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]
                  }
                  formatMonthYear={(locale, date) =>
                    date.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })
                  }
                />
              </div>
              <div className="form-group">
                <label>Час</label>
                <select
                  value={consultationForm.time}
                  onChange={(e) => setConsultationForm({ ...consultationForm, time: e.target.value })}
                  required
                  disabled={!consultationForm.preferredDate || availableTimes.length === 0}
                >
                  <option value="">Виберіть час</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {!consultationForm.preferredDate && <p className="info-message">Спочатку виберіть дату</p>}
                {consultationForm.preferredDate && availableTimes.length === 0 && (
                  <p className="error-message">Немає доступних слотів на цю дату</p>
                )}
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={!consultationForm.artist || !consultationForm.preferredDate || !consultationForm.time}
              >
                Відправити запит
              </button>
            </form>

            <h3>Історія бронювань та консультацій</h3>
            {bookings.length > 0 ? (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Тип</th>
                    <th>Майстер</th>
                    <th>Дата</th>
                    <th>Час</th>
                    <th>Опис</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((item) => (
                      <tr key={item._id}>
                        <td>{item.type === 'booking' ? 'Бронювання' : 'Консультація'}</td>
                        <td>{item.artist?.name || 'Невідомий'}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.time}</td>
                        <td>{item.description || 'Немає'}</td>
                        <td>{statusTranslations[item.status] || item.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>Бронювань або консультацій немає</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;