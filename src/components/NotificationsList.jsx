import { useNotifications } from '../contexts/NotificationsContext';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/formatters';
import api from '../services/api';

const NotificationsList = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To track navigation
  const { renderMessage, populateNotificationDetails, setUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const limit = 10;

  const resetNotifications = useCallback(() => {
    setPage(1);
    setNotifications([]); // Clear notifications
    setHasMore(true); // Reset hasMore to true to allow new fetches
    setUnreadCount(0); // Reset unread count
  }, [setUnreadCount]);

  useEffect(() => {
    resetNotifications();
  }, [location.key, resetNotifications]); // Use location.key to detect re-navigation

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/notifications', { params: { page, limit } });
        const newNotifications = data.notifications;

        // Populate details for each notification
        const updatedDetails = {};
        for (const notification of newNotifications) {
          const details = await populateNotificationDetails(notification);
          updatedDetails[notification.id] = details;
        }

        if (newNotifications.length < limit) {
          setHasMore(false); // No more notifications to load
        }

        // Handle edge-case where re-navigated to notifications
        if (page == 1) {
            resetNotifications();
        }

        setNotificationDetails((prev) => ({ ...prev, ...updatedDetails }));
        setNotifications((prev) => [...prev, ...newNotifications]);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setTimeout( async () => {
            setLoading(false);
          }, 1000)
      }
    };

    fetchNotifications();
  }, [page, populateNotificationDetails, resetNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const handleProfileNavigate = (e, notification) => {
    e.stopPropagation(); // Prevents navigation on click
    navigate(`/profile/${notification.actorId}`);
  };

  const handleNotificationClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {notifications.length > 0 ? (
        notifications.map((notification) => {
          const details = notificationDetails[notification.id];
          const message = renderMessage(notification);
          const link = details?.link ? details.link : '#';

          return (
            <div
              key={notification.id}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleNotificationClick(link)}
            >
              {/* Profile Section */}
              <div
                className="flex items-center mr-4 cursor-pointer"
                onClick={(e) => handleProfileNavigate(e, notification)}
              >
                {notification.actor.profilePictureUrl && (
                  <img
                    src={notification.actor.profilePictureUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Message Section */}
              <div className="flex-1">
                <p className="text-base mb-2">
                  <span
                    className="font-medium cursor-pointer"
                    onClick={(e) => handleProfileNavigate(e, notification)}
                  >
                    @{notification.actor.username}
                  </span>
                  &nbsp;{message}
                  {details?.source && (
                    <span className="italic text-gray-600 truncate max-w-[200px]">
                      &nbsp;&#x2018;{details.source}&#x2019;
                    </span>
                  )}
                </p>
                <p className="text-sm mb-2 text-gray">{formatTime(notification.createdAt)}</p>
              </div>

              {/* Source Image */}
              {details?.image && (
                <img
                  src={details.image}
                  alt="Source"
                  className="w-16 h-16 object-cover ml-4"
                />
              )}
            </div>
          );
        })
      ) : (
        !loading && <p className="text-center text-gray-500">No notifications yet</p>
      )}
      {loading && <p className="text-center text-gray-500">Loading more notifications...</p>}
    </div>
  );
};

export default NotificationsList;