import React, { useState, useEffect } from 'react';
import './NotificationManagement.css';

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
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div>
                <p>{notification.message}</p>
                {notification.details && <p>{notification.details}</p>}
                {notification.booking && (
                  <p>
                    Бронювання: {notification.booking.artist?.name || 'Невідомий'},{' '}
                    {new Date(notification.booking.date).toLocaleDateString('uk-UA')},{' '}
                    {notification.booking.time}
                  </p>
                )}
                {notification.consultation && (
                  <p>
                    Консультація: {notification.consultation.artist?.name || 'Невідомий'},{' '}
                    {new Date(notification.consultation.preferredDate).toLocaleDateString('uk-UA')},{' '}
                    {notification.consultation.time}
                  </p>
                )}
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="mark-read-btn"
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