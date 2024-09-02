import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../utils/socket';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    console.log(socket);

    // Subscribe to notifications for the current user
    if (userId) {
      socket.emit('subscribeToNotifications', userId);
    }

    // Handle incoming notifications
    socket.on('receiveNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
