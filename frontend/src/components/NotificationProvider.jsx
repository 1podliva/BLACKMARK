import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const NotificationProvider = ({ children, token, role, onNotificationReceived }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const listeners = useRef(new Set());

  // Function to notify all listeners of a new consultation-related notification
  const notifyListeners = (notification) => {
    if (notification.consultation || notification.booking) {
      listeners.current.forEach((listener) => listener(notification));
    }
  };

  // Allow child components to subscribe to consultation notifications
  useEffect(() => {
    if (onNotificationReceived) {
      listeners.current.add(onNotificationReceived);
      return () => {
        listeners.current.delete(onNotificationReceived);
      };
    }
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!token) return;

    // Перевірка ролі адміна
    const verifyAdmin = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(res.ok);
      } catch (err) {
        console.error('Помилка перевірки адміна:', err);
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:5000', {
      query: { token },
      transports: ['websocket'],
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
              {notification.booking.type === 'booking' ? 'Бронювання' : 'Консультація'}: {notification.booking.artist?.name || 'Невідомий'},{' '}
              {new Date(notification.booking.date || notification.booking.preferredDate).toLocaleDateString('uk-UA')},{' '}
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

      const toastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: role === 'admin' ? 'admin-toast' : 'user-toast',
      };

      toast.info(
        <div>
          <strong>{message}</strong>
          {details}
        </div>,
        toastOptions
      );

      // Notify listeners if the notification is about a consultation or booking
      notifyListeners(notification);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message);
      toast.error('Помилка підключення до сповіщень', {
        className: role === 'admin' ? 'admin-toast' : 'user-toast',
      });
      if (err.message === 'Authentication error') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    });

    return () => {
      socket.disconnect();
      console.log('WebSocket disconnected');
    };
  }, [token, role]);

  // If children is a function (render prop), call it with onNotificationReceived
  // Otherwise, render children directly
  const renderChildren = typeof children === 'function' ? children(onNotificationReceived) : children;

  return (
    <>
      {renderChildren}
      <ToastContainer />
    </>
  );
};

export default NotificationProvider;