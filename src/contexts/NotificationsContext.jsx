import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../utils/socket';
import api from '../services/api';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  // Store all notification objects in an array
  const [notifications, setNotifications] = useState([]);
  // Lookup object with notificationId: details
  const [notificationDetails, setNotificationDetails] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    // Subscribe to notifications for the current user
    if (userId) {
      socket.emit('subscribeToNotifications', userId);
    }

    // Handle incoming notifications
    socket.on('receiveNotification', async (notification) => {
      const details = await fetchNotificationDetails(notification);
      setNotificationDetails((prev) => ({ ...prev, [notification.id]: details }));
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, []);

  const fetchNotificationDetails = async (notification) => {
    try {
      let details = {};

      if (notification.type === 'follow') {
        return details;
      }
      if (notification.type === 'post_like' || notification.type === 'post_comment') {
        const { data } = await api.get(`/posts/${notification.sourceId}`);
        details = { ...data, link: `/posts/${notification.sourceId}` };
      } 
      else if (notification.type === 'comment_like' || notification.type === 'comment_reply') {
        const { data: commentData} = await api.get(`/comments/${notification.sourceId}`);
        console.log(notification.sourceId);
        console.log(commentData);
        const commentPostId = commentData.comment.postId;
        console.log(commentPostId);

        const { data } = await api.get(`/posts/${commentPostId}`);
        details = { ...data, link: `/posts/${commentPostId}` };
      } 
      else if (notification.type === 'realm_join') {
        const { data } = await api.get(`/realms/${notification.sourceId}`);
        details = { ...data, link: `/realms/${notification.sourceId}` };
      }

      return details;
    } 
    catch (error) {
      console.error('Error fetching notification details', error);
      return {};
    }
  };

  const renderMessage = (notification) => {
    const { type, actor } = notification;
    switch (type) {
      case 'follow':
        return `${actor.username} started following you`;
      case 'post_like':
        return `${actor.username} liked your post`;
      case 'post_comment':
        return `${actor.username} commented on your post`;
      case 'comment_like':
        return `${actor.username} liked your comment`
      case 'comment_reply':
        return `${actor.username} replied to your comment`
      case 'realm_join':
        return `${actor.username} joined your realm`
      default:
        return 'You have a new notification';
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    const updatedDetails = {...notificationDetails};
    delete updatedDetails[id];
    setNotificationDetails(updatedDetails);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, notificationDetails, renderMessage, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
