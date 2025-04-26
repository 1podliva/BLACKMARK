import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    avatar: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [bookingForm, setBookingForm] = useState({
    artist: '',
    date: '',
    time: '',
    description: '',
  });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: null,
      });
      fetchBookings();
    }
  }, [user]);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName);
      formData.append('lastName', profileForm.lastName);
      if (profileForm.avatar) {
        formData.append('avatar', profileForm.avatar);
      }

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Бронювання створено!');
      setBookingForm({ artist: '', date: '', time: '', description: '' });
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return <p>Будь ласка, увійдіть, щоб переглянути профіль.</p>;
  }

  return (
    <section className="profile-section" id="profile">
      <div className="profile-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Ваш профіль</h2>
          <h1 className="main-title">
            <span className="first-line">Особиста</span>
            <span className="second-line">Зона</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Керуйте своїми записами, переглядайте історію та налаштування.
          </p>
        </div>

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
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Прізвище</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, lastName: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, avatar: e.target.files[0] })
                  }
                />
              </div>
              <button type="submit" className="submit-btn">
                Зберегти
              </button>
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
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Новий пароль</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Підтвердження нового пароля</label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Змінити пароль
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="profile-details">
            <h3>Нове бронювання</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Майстер</label>
                <input
                  type="text"
                  value={bookingForm.artist}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, artist: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Дата</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Час</label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Опис (ідея татуювання)</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, description: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="submit-btn">
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