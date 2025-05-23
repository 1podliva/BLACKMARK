import React, { useEffect } from 'react';
import './NotificationManagement.css';

const NotificationManagement = ({ token, toast, notifications, fetchNotifications, onNotificationReceived }) => {
  const handleNotification = (notification) => {
    fetchNotifications();
  };

  useEffect(() => {
    if (onNotificationReceived) {
      onNotificationReceived(handleNotification);
    }
  }, [onNotificationReceived, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Сповіщення позначено як прочитане', { className: 'admin-toast', autoClose: 3000 });
      fetchNotifications();
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
    }
  };

  return (
    <div className="notification-management">
      <h3>Сповіщення</h3>
      {notifications.length > 0 ? (
        <ul className="blog-ul">
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
                {/* {notification.consultation && (
                  <p>
                    Консультація: {notification.consultation.artist?.name || 'Невідомий'},{' '}
                    {new Date(notification.consultation.preferredDate).toLocaleDateString('uk-UA')},{' '}
                    {notification.consultation.time}
                  </p>
                )} */}
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