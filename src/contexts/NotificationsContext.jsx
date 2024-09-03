import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../utils/socket';
import api from '../services/api';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  // Store all notification objects in an array
  const [notifications, setNotifications] = useState([]);
  // Lookup object with notificationId: details
  const [notificationDetails, setNotificationDetails] = useState({});
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    // Fetch initial notifications on mount
    const fetchInitialNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/notifications', { params: { page: 1, limit: 10 } });
        const notifications = data.notifications;

        // Populate notification details
        notifications.forEach(async (notification) => {
          const details = await fetchNotificationDetails(notification);
          setNotificationDetails((prev) => ({ ...prev, [notification.id]: details }));
        });

        // Set initial notifications
        setNotifications(notifications);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to notifications for the current user
    if (userId) {
      socket.emit('subscribeToNotifications', userId);
    }

    // Fetch initial notifications
    fetchInitialNotifications();

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

  // Effect for fetching more notifications when page changes
  useEffect(() => {
    if (page === 1) return; // Skip fetching on initial mount
    
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
        const notifications = data.notifications;

        // Populate notification details
        notifications.forEach(async (notification) => {
          const details = await fetchNotificationDetails(notification);
          setNotificationDetails((prev) => ({ ...prev, [notification.id]: details }));
        });

        // Append new notifications to existing state
        setNotifications((prev) => [...prev, ...notifications]);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  const fetchNotificationDetails = async (notification) => {
    try {
      let details = {};

      if (notification.type === 'follow') {
        details = { link: `/profile/${notification.sourceId}`, image: notification.actor.profilePictureUrl };
      } 
      else if (notification.type === 'post_like' || notification.type === 'post_comment') {
        const { data } = await api.get(`/posts/${notification.sourceId}`);

        details = { link: `/posts/${notification.sourceId}`, image: data.post.images[0]?.url || null };
      } 
      else if (notification.type === 'comment_like' || notification.type === 'comment_reply') {
        const { data: commentData } = await api.get(`/comments/${notification.sourceId}`);
        const { data: postData } = await api.get(`/posts/${commentData.comment.postId}`);
        details = { link: `/posts/${commentData.comment.postId}`, image: postData.post.images[0]?.url || null };
      } 
      else if (notification.type === 'realm_join') {
        const { data } = await api.get(`/realms/${notification.sourceId}`);

        details = { link: `/realms/${notification.sourceId}`, image: data.realm.realmPictureUrl };
      }

      return details;
    } 
    catch (error) {
      console.error('Error fetching notification details', error);
      return {};
    }
  };

  const loadMoreNotifications = () => {
    if (page < totalPages && !loading) {
      setPage((prevPage) => prevPage + 1);
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
        return `${actor.username} liked your comment`;
      case 'comment_reply':
        return `${actor.username} replied to your comment`;
      case 'realm_join':
        return `${actor.username} joined your realm`;
      default:
        return 'You have a new notification';
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        notificationDetails,
        renderMessage,
        loadMoreNotifications,
        loading,
        hasMore: page < totalPages,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
