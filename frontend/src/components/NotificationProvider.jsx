import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const NotificationProvider = ({ children, token, role, onNotificationReceived }) => {
  const [userData, setUserData] = useState(null);
  const listeners = useRef(new Set());
  const socketRef = useRef(null);

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

  // Fetch user data to get role and ID
  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data); // { _id, role, firstName, lastName, email, ... }
        } else {
          console.error('Failed to fetch user data:', res.status, await res.json());
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserData(null);
      }
    };

    fetchUserData();
  }, [token]);

  // Set up WebSocket connection
  useEffect(() => {
    if (!token || !userData) return;

    const socket = io('http://localhost:5000', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      socket.emit('join', userData._id); // Join the user's room
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
        className: userData.role === 'admin' ? 'admin-toast' : 'user-toast',
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
        className: userData?.role === 'admin' ? 'admin-toast' : 'user-toast',
      });
      if (err.message === 'Authentication error') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    return () => {
      socket.disconnect();
      console.log('WebSocket disconnected');
      socketRef.current = null;
    };
  }, [token, userData]);

  // Render children (support both render prop and direct children)
  const renderChildren = typeof children === 'function' ? children(onNotificationReceived) : children;

  return <>{renderChildren}</>;
};

export default NotificationProvider;  