import React, { useState, useEffect } from 'react';

const NotificationManagement = ({ token, setError, setSuccess }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setSuccess('Сповіщення позначено як прочитане');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="notification-management">
      <h3>Сповіщення</h3>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification._id}
              style={{
                padding: '10px',
                background: notification.read ? 'var(--navy-gray)' : 'var(--purple-accent)',
                marginBottom: '5px',
                borderRadius: '5px',
                color: 'var(--soft-white)',
              }}
            >
              <p>{notification.message}</p>
              {notification.booking && (
                <p>
                  Бронювання: {notification.booking.artist},{' '}
                  {new Date(notification.booking.date).toLocaleDateString()},{' '}
                  {notification.booking.time}
                </p>
              )}
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  style={{ background: 'var(--purple-hover)', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
                >
                  Позначити як прочитане
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Сповіщень немає</p>
      )}
    </div>
  );
};

export default NotificationManagement;