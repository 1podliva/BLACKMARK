import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const NotificationProvider = ({ children, token }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Перевірка ролі адміна
    const verifyAdmin = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Помилка перевірки адміна:', err);
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, [token]);

  useEffect(() => {
    if (!token || !isAdmin) return;

    const socket = io('http://localhost:5000', {
      auth: { token: `Bearer ${token}` },
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('newNotification', (notification) => {
      console.log('New notification:', notification);

      const message = notification.message;
      const details = notification.details ? (
        <div>
          <p>{notification.details}</p>
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
      ) : null;

      toast.info(
        <div>
          <strong>{message}</strong>
          {details}
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message);
      toast.error('Помилка підключення до сповіщень');
    });

    return () => {
      socket.disconnect();
      console.log('WebSocket disconnected');
    };
  }, [token, isAdmin]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export default NotificationProvider;