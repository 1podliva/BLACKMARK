import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { FiUser, FiLock, FiCalendar, FiEdit, FiUpload, FiMail, FiScissors, FiClock, FiLogOut } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import io from 'socket.io-client';

const Profile = () => {
  const { user, token, logout, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', avatar: null, isEditing: false });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [consultationForm, setConsultationForm] = useState({ artist: '', preferredDate: '', time: '' });
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [artistSchedules, setArtistSchedules] = useState([]);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [consultationErrors, setConsultationErrors] = useState({});
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      navigate('/');
    } else {
      // Initialize Socket.IO
      const newSocket = io('http://localhost:5000', {
        auth: { token: `Bearer ${token}` },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        newSocket.emit('join', user._id);
      });

      newSocket.on('newNotification', (notification) => {
        toast.info(notification.message, { className: 'info-toast', autoClose: 3000 });
        fetchBookings(); // Refresh bookings when a notification is received
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token, loading, navigate]);

  const statusTranslations = {
    pending: 'На розгляді',
    confirmed: 'Підтверджено',
    completed: 'Завершено',
    cancelled: 'Скасовано',
    reviewed: 'Переглянуто',
  };

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '', avatar: null, isEditing: false });
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
    if (consultationForm.artist) {
      fetchArtistSchedules(consultationForm.artist);
    } else {
      setArtistSchedules([]);
      setAvailableTimes([]);
    }
  }, [consultationForm.artist]);

  const fetchBookings = async () => {
    try {
      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      if (!bookingsRes.ok) throw new Error(bookingsData.message || 'Failed to fetch bookings');

      const consultationsRes = await fetch('http://localhost:5000/api/bookings/consultations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const consultationsData = await consultationsRes.json();
      if (!consultationsRes.ok) throw new Error(consultationsData.message || 'Failed to fetch consultations');

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
      toast.error(`😢 ${err.message}`, { toastId: 'fetch-bookings-error', className: 'error-toast', autoClose: 3000 });
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/artists');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch artists');
      setArtists(data);
    } catch (err) {
      toast.error(`😢 ${err.message}`, { toastId: 'fetch-artists-error', className: 'error-toast', autoClose: 3000 });
    }
  };

  const fetchArtistSchedules = async (artistId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/artist-schedules/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      setArtistSchedules(data || []);
    } catch (err) {
      toast.error(`😢 ${err.message}`, { toastId: 'fetch-schedules-error', className: 'error-toast', autoClose: 3000 });
      setArtistSchedules([]);
    }
  };

  const fetchAvailableTimes = async (artistId, date) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/availability?artist=${artistId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      setAvailableTimes(data.availableTimes || []);
      if (!data.availableTimes || data.availableTimes.length === 0) {
        toast.error('Немає доступних слотів на цю дату', { toastId: 'no-available-times', className: 'error-toast', autoClose: 3000 });
      }
    } catch (err) {
      toast.error(`😢 ${err.message}`, { toastId: 'fetch-available-times-error', className: 'error-toast', autoClose: 3000 });
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
      toast.success('🦄 Профіль оновлено!', { className: 'success-toast', autoClose: 3000 });
      setProfileForm((prev) => ({ ...prev, isEditing: false }));
    } catch (err) {
      toast.error(`😢 ${err.message}`, { className: 'error-toast', autoClose: 3000 });
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
      toast.success('🦄 Пароль оновлено!', { className: 'success-toast', autoClose: 3000 });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(`😢 ${err.message}`, { className: 'error-toast', autoClose: 3000 });
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
      if (!res.ok) throw new Error(data.message || 'Server error');
      toast.success('🦄 Запит на консультацію відправлено!', { className: 'success-toast', autoClose: 3000 });
      setConsultationForm({ artist: '', preferredDate: '', time: '' });
      setAvailableTimes([]);
      setArtistSchedules([]);
      await fetchBookings();
      if (consultationForm.artist && consultationForm.preferredDate) {
        await fetchAvailableTimes(consultationForm.artist, consultationForm.preferredDate);
      }
    } catch (err) {
      toast.error(`${err.message}`, { className: 'error-toast', autoClose: 3000 });
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
      if (!res.ok) throw new Error(data.message || 'Server error');
      toast.success(`🦄 ${type === 'booking' ? 'Бронювання' : 'Консультація'} скасовано!`, {
        className: 'success-toast',
        autoClose: 3000,
      });
      await fetchBookings();
    } catch (err) {
      toast.error(`😢 ${err.message}`, { className: 'error-toast', autoClose: 3000 });
    }
  };

  const handleRequestCancellation = async (id, type) => {
    if (!window.confirm('Ви впевнені, що хочете надіслати запит на скасування менеджеру?')) return;
    try {
      const endpoint =
        type === 'booking'
          ? `http://localhost:5000/api/bookings/${id}/request-cancel`
          : `http://localhost:5000/api/bookings/consultations/${id}/request-cancel`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      toast.success('🦄 Запит на скасування надіслано менеджеру!', {
        className: 'success-toast',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error(`😢 ${err.message}`, { className: 'error-toast', autoClose: 3000 });
    }
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setConsultationForm({ ...consultationForm, preferredDate: formattedDate, time: '' });
  };

  const isWorkingDay = (date) => {
    if (!artistSchedules.length) return false;
    const calendarYear = date.getFullYear();
    const calendarMonth = date.getMonth();
    const calendarDay = date.getDate();
    return artistSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getFullYear() === calendarYear &&
        scheduleDate.getMonth() === calendarMonth &&
        scheduleDate.getDate() === calendarDay
      );
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isPast = date < tomorrow;
    const isWorking = isWorkingDay(date);
    if (isPast) return 'react-calendar__tile--past';
    if (isWorking) return 'react-calendar__tile--working';
    return null;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <h2 className="dashboard-welcome">
        <span className="welcome-accent">Вітаємо,</span> {profileForm.firstName || 'Користувач'}! 👋
      </h2>

      <div className="dashboard-grid">
        <div className="profile-card solid-card">
          <div className="avatar-container" onClick={() => document.getElementById('avatarInput').click()}>
            {user.avatar ? (
              <img
                src={`http://localhost:5000${user.avatar}`}
                alt="Avatar"
                className="avatar"
              />
            ) : (
              <div className="avatar-placeholder gradient-bg">
                {(profileForm.firstName || '')[0]}
              </div>
            )}
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.files[0] })}
            />
          </div>
          <div className="name-container">
            <div className={`name-field ${profileForm.isEditing ? 'editing' : ''}`}>
              <label><FiUser className="label-icon" /> Ім’я</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                disabled={!profileForm.isEditing}
              />
              <button
                className="edit-btn"
                onClick={() => setProfileForm((prev) => ({ ...prev, isEditing: !prev.isEditing }))}
              >
                <FiEdit size={16} />
              </button>
            </div>
            {profileErrors.firstName && <p className="error-message">{profileErrors.firstName}</p>}
            <div className={`name-field ${profileForm.isEditing ? 'editing' : ''}`}>
              <label><FiUser className="label-icon" /> Прізвище</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                disabled={!profileForm.isEditing}
              />
              <button
                className="edit-btn"
                onClick={() => setProfileForm((prev) => ({ ...prev, isEditing: !prev.isEditing }))}
              >
                <FiEdit size={16} />
              </button>
            </div>
            {profileErrors.lastName && <p className="error-message">{profileErrors.lastName}</p>}
            {profileForm.isEditing && (
              <button className="submit-btn" onClick={handleProfileSubmit}>Зберегти</button>
            )}
          </div>
          <div className="user-stats">
            <div className="stat-item">
              <FiCalendar className="stat-icon" />
              <span>{bookings.length} записів</span>
            </div>
            <div className="stat-item">
              <FiScissors className="stat-icon" />
              <span>{artists.length} майстрів</span>
            </div>
          </div>
        </div>

        <div className="activity-card solid-card">
          <h3><FiUser className="section-icon" /> Останні дії</h3>
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

      <div className="upcoming-section solid-card">
        <h3><FiClock className="section-icon" /> Найближчі сеанси</h3>
        {bookings.filter(
          (item) =>
            (item.status === 'pending' ||
              item.status === 'confirmed' ||
              (item.type === 'consultation' && item.status === 'reviewed')) &&
            new Date(item.date) > new Date()
        ).length > 0 ? (
          <div className="booking-list">
            {bookings
              .filter(
                (item) =>
                  (item.status === 'pending' ||
                    item.status === 'confirmed' ||
                    (item.type === 'consultation' && item.status === 'reviewed')) &&
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
                    <p>Опис: {item.description || 'Опис відсутній'}</p>
                    <p>Статус: {statusTranslations[item.status] || item.status}</p>
                  </div>
                  {item.status !== 'cancelled' && item.status !== 'completed' && (
                    <div className="booking-actions">
                      {item.status === 'pending' && !item.createdByAdmin ? (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelBooking(item._id, item.type)}
                        >
                          Скасувати
                        </button>
                      ) : (
                        <button
                          className="request-cancel-btn"
                          onClick={() => handleRequestCancellation(item._id, item.type)}
                        >
                          Звернутися до менеджера
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p>Майбутніх сеансів немає</p>
        )}
      </div>

      <div className="dashboard-bookings solid-card">
        <h3><FiClock className="section-icon" /> Останні записи</h3>
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
                    <p>Опис: {item.description || 'Опис відсутній'}</p>
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
  );

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="profile-section" id="profile">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="profile-tabs">
        {['dashboard', 'security', 'bookings'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {{
              dashboard: 'Дашборд',
              security: 'Безпека',
              bookings: 'Запит на консультацію'
            }[tab]}
          </button>
        ))}
        {user?.role === 'admin' && (
          <button
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Адмін-панель
          </button>
        )}
        <button className="tab logout" onClick={handleLogout}>
          <FiLogOut /> Вийти
        </button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}

      {activeTab === 'security' && (
        <div className="form-card solid-card">
          <h3><FiLock className="section-icon" /> Безпека</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className={`form-group ${passwordErrors.oldPassword ? 'has-error' : ''}`}>
              <label><FiLock className="label-icon" /> Старий пароль</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                required
              />
              {passwordErrors.oldPassword && <p className="error-message">{passwordErrors.oldPassword}</p>}
            </div>
            <div className={`form-group ${passwordErrors.newPassword ? 'has-error' : ''}`}>
              <label><FiLock className="label-icon" /> Новий пароль</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              {passwordErrors.newPassword && <p className="error-message">{passwordErrors.newPassword}</p>}
            </div>
            <div className={`form-group ${passwordErrors.confirmNewPassword ? 'has-error' : ''}`}>
              <label><FiLock className="label-icon" /> Підтвердження нового пароля</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                required
              />
              {passwordErrors.confirmNewPassword && <p className="error-message">{passwordErrors.confirmNewPassword}</p>}
            </div>
            <button type="submit" className="submit-btn">Змінити пароль</button>
          </form>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="form-card solid-card">
          <h3><FiCalendar className="section-icon" /> Запит на консультацію</h3>
          <form onSubmit={handleConsultationSubmit}>
            <div className={`form-group ${consultationErrors.artist ? 'has-error' : ''}`}>
              <label><FiUser className="label-icon" /> Майстер</label>
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
              {consultationErrors.artist && <p className="error-message">{consultationErrors.artist}</p>}
            </div>
            <div className={`form-group ${consultationErrors.preferredDate ? 'has-error' : ''}`}>
              <label><FiCalendar className="label-icon" /> Бажана дата</label>
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
                tileClassName={tileClassName}
              />
              {consultationErrors.preferredDate && <p className="error-message">{consultationErrors.preferredDate}</p>}
            </div>
            <div className={`form-group ${consultationErrors.time ? 'has-error' : ''}`}>
              <label><FiClock className="label-icon" /> Час</label>
              <select
                value={consultationForm.time}
                onChange={(e) => setConsultationForm({ ...consultationForm, time: e.target.value })}
                required
                disabled={!consultationForm.artist || !consultationForm.preferredDate || availableTimes.length === 0}
              >
                <option value="">Виберіть час</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {consultationErrors.time && <p className="error-message">{consultationErrors.time}</p>}
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
      )}
    </section>
  );
};

export default Profile;