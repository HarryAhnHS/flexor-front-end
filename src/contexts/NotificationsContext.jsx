import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socket from '../utils/socket';
import api from '../services/api';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
      const notifications = data.notifications;

      notifications.forEach(async (notification) => {
        const details = await populateNotificationDetails(notification);
        setNotificationDetails((prev) => ({ ...prev, [notification.id]: details }));
      });

      setNotifications(notifications);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (userId) {
      socket.emit('subscribeToNotifications', userId);
    }

    fetchNotifications();

    socket.on('receiveNotification', async (notification) => {
      const details = await populateNotificationDetails(notification);
      setNotificationDetails((prev) => ({ ...prev, [notification.id]: details }));
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (page === 1) return;
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const refetchNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const populateNotificationDetails = async (notification) => {
    try {
      let details = {};
      if (notification.type === 'follow') {
        details = { 
          actorLink:`/profile/${notification.actorId}`, 
          link: `/profile/${notification.actorId}`, 
          image: notification.actor.profilePictureUrl,   
        };
      } 
      else if (notification.type === 'post_like' || notification.type === 'post_comment') {
        details = { 
          actorLink:`/profile/${notification.actorId}`, 
          link: `/posts/${notification.postId}`, 
          image: notification.post.images[0]?.url || null 
        };
      } 
      else if (notification.type === 'comment_like' || notification.type === 'comment_reply') {
        details = { 
          actorLink:`/profile/${notification.actorId}`, 
          link: `/posts/${notification.comment.postId}`, 
          image: notification.comment.post.images[0]?.url || null 
        };
      } 
      else if (notification.type === 'realm_join') {
        details = { 
          actorLink:`/profile/${notification.actorId}`, 
          link: `/realms/${notification.realmId}`, 
          image: notification.realm.realmPictureUrl
        };
      }
      return details;
    } 
    catch (error) {
      console.error('Error fetching notification details', error);
      return {};
    }
  };

  const renderMessage = (notification) => {
    const { type } = notification;
    switch (type) {
      case 'follow':
        return `started following you`;
      case 'post_like':
        return `liked your post`;
      case 'post_comment':
        return `commented on your post`;
      case 'comment_like':
        return `liked your comment`;
      case 'comment_reply':
        return `replied to your comment`;
      case 'realm_join':
        return `joined your realm`;
      default:
        return 'You have a new notification';
    }
  };

  const loadMoreNotifications = () => {
    if (page < totalPages && !loading) {
      setPage((prevPage) => prevPage + 1);
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
        refetchNotifications, // Provide the refetch function
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);