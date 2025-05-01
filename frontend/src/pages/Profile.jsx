import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Profile.css';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', avatar: null });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [consultationForm, setConsultationForm] = useState({ artist: '', preferredDate: '', time: '' });
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [consultationErrors, setConsultationErrors] = useState({});
  const navigate = useNavigate();

  // Перевіряємо авторизацію
  useEffect(() => {
    if (!user && !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  const statusTranslations = {
    pending: 'На розгляді',
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

  const fetchBookings = async () => {
    try {
      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      if (!bookingsRes.ok) throw new Error(bookingsData.message);

      const consultationsRes = await fetch('http://localhost:5000/api/bookings/consultations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const consultationsData = await consultationsRes.json();
      if (!consultationsRes.ok) throw new Error(consultationsData.message);

      const combinedBookings = [
        ...bookingsData.map((b) => ({ ...b, type: 'booking' })),
        ...consultationsData.map((c) => ({
          ...c,
          type: 'consultation',
          date: c.preferredDate,
          description: c.description || 'Консультація',
        })),
      ];
      setBookings(combinedBookings);
    } catch (err) {
      toast.error(err.message, { toastId: 'fetch-bookings-error', className: 'user-toast', autoClose: 3000 });
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/artists');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setArtists(data);
    } catch (err) {
      toast.error(err.message, { toastId: 'fetch-artists-error', className: 'user-toast', autoClose: 3000 });
    }
  };

  const fetchAvailableTimes = async (artistId, date) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка сервера');
      setAvailableTimes(data.availableTimes || []);
      if (!data.availableTimes || data.availableTimes.length === 0) {
        toast.error('Немає доступних слотів на цю дату', { toastId: 'no-available-times', className: 'user-toast', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(err.message, { toastId: 'fetch-available-times-error', className: 'user-toast', autoClose: 3000 });
      setAvailableTimes([]);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.firstName) errors.firstName = 'Ім’я обов’язкове';
    if (!profileForm.lastName) errors.lastName = 'Прізвище обов’язкове';
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      toast.success('Профіль оновлено!', { toastId: 'profile-update-success', className: 'user-toast', autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { toastId: 'profile-update-error', className: 'user-toast', autoClose: 3000 });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.oldPassword) errors.oldPassword = 'Введіть старий пароль';
    if (!passwordForm.newPassword) errors.newPassword = 'Введіть новий пароль';
    if (!passwordForm.confirmNewPassword) errors.confirmNewPassword = 'Підтвердіть новий пароль';
    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Паролі не співпадають';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      toast.success('Пароль оновлено!', { toastId: 'password-update-success', className: 'user-toast', autoClose: 3000 });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message, { toastId: 'password-update-error', className: 'user-toast', autoClose: 3000 });
    }
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!consultationForm.artist) errors.artist = 'Виберіть майстра';
    if (!consultationForm.preferredDate) errors.preferredDate = 'Виберіть дату';
    if (!consultationForm.time) errors.time = 'Виберіть час';
    setConsultationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/bookings/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(consultationForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка сервера');
      toast.success('Запит на консультацію відправлено!', { toastId: 'consultation-submit-success', className: 'user-toast', autoClose: 3000 });
      const { artist, preferredDate } = consultationForm;
      setConsultationForm({ artist: '', preferredDate: '', time: '' });
      setAvailableTimes([]);
      await fetchBookings();
      if (artist && preferredDate) {
        await fetchAvailableTimes(artist, preferredDate);
      }
    } catch (err) {
      toast.error(err.message, { toastId: 'consultation-submit-error', className: 'user-toast', autoClose: 3000 });
    }
  };

  const handleCancelBooking = async (id, type) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати цей запис?')) return;
    try {
      const endpoint =
        type === 'booking'
          ? `http://localhost:5000/api/bookings/${id}/cancel`
          : `http://localhost:5000/api/bookings/consultations/${id}/cancel`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка сервера');
      toast.success(`${type === 'booking' ? 'Бронювання' : 'Консультація'} скасовано!`, {
        toastId: `cancel-${id}`, // Унікальний ID для тосту
        className: 'user-toast',
        autoClose: 3000,
      });
      await fetchBookings();
    } catch (err) {
      toast.error(err.message, { toastId: `cancel-error-${id}`, className: 'user-toast', autoClose: 3000 });
    }
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setConsultationForm({ ...consultationForm, preferredDate: formattedDate, time: '' });
  };

  const handleLogout = () => {
    logout();
  };

  if (user === null) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <section className="profile-section" id="profile">
      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Дашборд
          </button>
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
            Консультація
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

        {activeTab === 'dashboard' && (
          <div className="dashboard">
            {/* Заголовок */}
            <h2 className="dashboard-welcome">Вітаємо, {user.firstName}!</h2>

            <div className="dashboard-grid">
              {/* Центральний блок */}
              <div className="dashboard-main">
                <div className="profile-card">
                  <div className="avatar-container">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt="Avatar"
                        className="avatar"
                      />
                    ) : (
                      <div className="avatar-placeholder">{user.firstName[0]}</div>
                    )}
                    <h3 className="user-name">{`${user.firstName} ${user.lastName}`}</h3>
                  </div>
                  <div className="contact-info">
                    <p>
                      <i className="fas fa-envelope"></i> {user.email}
                    </p>
                    {/* Якщо додано поле телефону в моделі User, можна розкоментувати */}
                    {/* <p><i className="fas fa-phone"></i> {user.phone || 'Не вказано'}</p> */}
                  </div>
                  <button
                    className="edit-profile-btn"
                    onClick={() => setActiveTab('personal')}
                  >
                    Редагувати профіль
                  </button>
                </div>
              </div>

              {/* Блок "Останні дії" */}
              <div className="dashboard-activity">
                <h3>Останні дії</h3>
                <div className="activity-list">
                  {bookings.slice(0, 3).map((item) => (
                    <div key={item._id} className="activity-item">
                      <p>
                        {item.type === 'booking' ? 'Бронювання' : 'Консультація'} створено
                      </p>
                      <span>{new Date(item.date).toLocaleDateString('uk-UA')}</span>
                    </div>
                  ))}
                  {bookings.length === 0 && <p>Дій немає</p>}
                </div>
              </div>
            </div>

            {/* Блок "Сеанси попереду" */}
            <div className="dashboard-upcoming">
              <h3>Сеанси попереду</h3>
              {bookings.filter(
                (item) =>
                  (item.status === 'pending' || item.status === 'confirmed') &&
                  new Date(item.date) > new Date()
              ).length > 0 ? (
                <div className="booking-list">
                  {bookings
                    .filter(
                      (item) =>
                        (item.status === 'pending' || item.status === 'confirmed') &&
                        new Date(item.date) > new Date()
                    )
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item._id} className="booking-item">
                        <div className="booking-details">
                          <p>
                            <strong>{item.type === 'booking' ? 'Бронювання' : 'Консультація'}</strong>
                          </p>
                          <p>Майстер: {item.artist?.name || 'Невідомий'}</p>
                          <p>Дата: {new Date(item.date).toLocaleDateString('uk-UA')}</p>
                          <p>Час: {item.time}</p>
                          <p>Статус: {statusTranslations[item.status] || item.status}</p>
                        </div>
                        {item.createdByAdmin && item.status !== 'cancelled' && item.status !== 'completed' && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelBooking(item._id, item.type)}
                          >
                            Скасувати
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p>Майбутніх сеансів немає</p>
              )}
            </div>

            {/* Блок "Останні записи" */}
            <div className="dashboard-bookings">
              <h3>Останні записи</h3>
              {bookings.filter(
                (item) =>
                  item.status === 'completed' ||
                  item.status === 'cancelled' ||
                  new Date(item.date) <= new Date()
              ).length > 0 ? (
                <div className="booking-list">
                  {bookings
                    .filter(
                      (item) =>
                        item.status === 'completed' ||
                        item.status === 'cancelled' ||
                        new Date(item.date) <= new Date()
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item._id} className="booking-item">
                        <div className="booking-details">
                          <p>
                            <strong>{item.type === 'booking' ? 'Бронювання' : 'Консультація'}</strong>
                          </p>
                          <p>Майстер: {item.artist?.name || 'Невідомий'}</p>
                          <p>Дата: {new Date(item.date).toLocaleDateString('uk-UA')}</p>
                          <p>Час: {item.time}</p>
                          <p>Статус: {statusTranslations[item.status] || item.status}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p>Записів немає</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="profile-details">
            <div className="form-card">
              <h3>Особисті дані</h3>
              <form onSubmit={handleProfileSubmit}>
                <div className={`form-group ${profileErrors.firstName ? 'has-error' : ''}`}>
                  <label>Ім’я</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  {profileErrors.firstName && <p className="error-message">{profileErrors.firstName}</p>}
                </div>
                <div className={`form-group ${profileErrors.lastName ? 'has-error' : ''}`}>
                  <label>Прізвище</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                  {profileErrors.lastName && <p className="error-message">{profileErrors.lastName}</p>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope"></i>
                    <input type="email" value={user.email} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label>Аватарка</label>
                  <div className="input-wrapper">
                    <i className="fas fa-image"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.files[0] })}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">Зберегти</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-details">
            <div className="form-card">
              <h3>Безпека</h3>
              <form onSubmit={handlePasswordSubmit}>
                <div className={`form-group ${passwordErrors.oldPassword ? 'has-error' : ''}`}>
                  <label>Старий пароль</label>
                  <div className="input-wrapper">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      required
                    />
                  </div>
                  {passwordErrors.oldPassword && <p className="error-message">{passwordErrors.oldPassword}</p>}
                </div>
                <div className={`form-group ${passwordErrors.newPassword ? 'has-error' : ''}`}>
                  <label>Новий пароль</label>
                  <div className="input-wrapper">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  {passwordErrors.newPassword && <p className="error-message">{passwordErrors.newPassword}</p>}
                </div>
                <div className={`form-group ${passwordErrors.confirmNewPassword ? 'has-error' : ''}`}>
                  <label>Підтвердження нового пароля</label>
                  <div className="input-wrapper">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      required
                    />
                  </div>
                  {passwordErrors.confirmNewPassword && <p className="error-message">{passwordErrors.confirmNewPassword}</p>}
                </div>
                <button type="submit" className="submit-btn">Змінити пароль</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="profile-details">
            <div className="form-card">
              <h3>Запит на консультацію</h3>
              <form onSubmit={handleConsultationSubmit}>
                <div className={`form-group ${consultationErrors.artist ? 'has-error' : ''}`}>
                  <label>Майстер</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user-tie"></i>
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
                  {consultationErrors.artist && <p className="error-message">{consultationErrors.artist}</p>}
                </div>
                <div className={`form-group ${consultationErrors.preferredDate ? 'has-error' : ''}`}>
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
                  {consultationErrors.preferredDate && <p className="error-message">{consultationErrors.preferredDate}</p>}
                </div>
                <div className={`form-group ${consultationErrors.time ? 'has-error' : ''}`}>
                  <label>Час</label>
                  <div className="input-wrapper">
                    <i className="fas fa-clock"></i>
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
                  </div>
                  {consultationErrors.time && <p className="error-message">{consultationErrors.time}</p>}
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;