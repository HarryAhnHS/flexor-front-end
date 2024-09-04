import { createContext, useContext, useEffect } from 'react';
import socket from '../utils/socket';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (userId) {
      socket.emit('subscribeToNotifications', userId);
    }

    socket.on('receiveNotification', async (notification) => {
      const details = await populateNotificationDetails(notification);
      // Popup notification
      const message = `@${notification.actor.username} ${renderMessage(notification)} ${details.source && details.source}!`;  
      toast(message, {
        onClick: () => {
          if (details.link) {
            navigate(details.link);
          }
        },
        autoClose: 5000, // Adjust the duration the toast is visible
        position: "top-right", // Adjust position if needed
        hideProgressBar: false,
        closeButton: true,
        draggable: true,
        pauseOnHover: true,
        theme: "light", // Or "dark" based on your preference
      });
    });
    
    return () => {
      socket.off('receiveNotification');
    };
  }, [navigate]);

  // Helper function to populate details with respective resources based on sourceType
  const populateNotificationDetails = async (notification) => {
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
        image: notification.post.images[0]?.url || null,
        source: notification.post.title, 
      };
    } 
    else if (notification.type === 'comment_like' || notification.type === 'comment_reply') {
      details = { 
        actorLink:`/profile/${notification.actorId}`, 
        link: `/posts/${notification.comment.postId}`, 
        image: notification.comment.post.images[0]?.url || null,
        source: notification.comment.comment, 
      };
    } 
    else if (notification.type === 'realm_join') {
      details = { 
        actorLink:`/profile/${notification.actorId}`, 
        link: `/realms/${notification.realmId}`, 
        image: notification.realm.realmPictureUrl,
        source: notification.realm.name,
      };
    }
    return details;
  };

  // Helper function to render respective message based on sourceType
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

  return (
    <NotificationsContext.Provider
      value={{
        populateNotificationDetails,
        renderMessage,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);