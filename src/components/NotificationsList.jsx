import { useNotifications } from '../contexts/NotificationsContext';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/formatters';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { PuffLoader } from 'react-spinners';
import { useOutletContext } from 'react-router-dom'; // Import useOutletContext for scrollevent to paginate

const NotificationsList = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To track navigation
  const { renderMessage, populateNotificationDetails, setUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false); // Trigger refresh
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const limit = 10;

  const { scrollableRef } = useOutletContext();

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
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page, populateNotificationDetails, resetNotifications, refresh]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        scrollableRef.current &&
        scrollableRef.current.scrollTop + scrollableRef.current.clientHeight >=
          scrollableRef.current.scrollHeight - 100 &&
        hasMore &&
        !loading
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollableRef, hasMore, loading]);

  const handleProfileNavigate = (e, notification) => {
    e.stopPropagation(); // Prevents navigation on click
    navigate(`/profile/${notification.actorId}`);
  };

  const handleNotificationClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  const handleRefresh = () => {
    resetNotifications(); // Clear current notifications
    setRefresh((prev) => !prev); // Trigger refresh
  };

  return (
    <div className="flex flex-col space-y-4 bg-gray-900 min-h-screen text-white">
      <div className='flex items-center justify-center'>
          <button
            onClick={handleRefresh}
            className='flex items-center p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition'
          >  
            <FontAwesomeIcon icon={faArrowsRotate} />
          </button>
        </div>
      {notifications.length > 0 ? (
        notifications.map((notification) => {
          const details = notificationDetails[notification.id];
          const message = renderMessage(notification);
          const link = details?.link ? details.link : '#';

          return (
            <div
              key={notification.id}
              className="flex items-center p-4 bg-gray-800 rounded-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleNotificationClick(link)}
            >
              {/* Profile Section */}
              <div
                className="flex items-center justify-center mr-2 cursor-pointer"
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
              <div className="flex-1 flex-col justify-center space-y-2">
                <p className="text-base">
                  <span
                    className="font-medium cursor-pointer text-blue-400 hover:text-blue-500 hover:underline"
                    onClick={(e) => handleProfileNavigate(e, notification)}
                  >
                    @{notification.actor.username}
                  </span>
                  &nbsp;{message}
                  {details?.source && (
                    <span className="italic text-gray-400 overflow-hidden text-ellipsis overflow-wrap-break-word break-all line-clamp-1">
                      &nbsp;&#x2018;{details.source}&#x2019;
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(notification.createdAt)}
                </p>
              </div>

              {/* Source Image */}
              {details?.image && (
                <img
                  src={details.image}
                  alt="Source"
                  className="w-16 h-16 object-cover ml-4 rounded-md"
                />
              )}
            </div>
          );
        })
      ) : (
        !loading && <p className="text-center text-gray-500">No notifications yet</p>
      )}
      {loading && (
        <div className="flex justify-center items-center h-full">
          <PuffLoader color="#5C6BC0" size={60} />
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
