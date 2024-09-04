import { useNotifications } from '../contexts/NotificationsContext';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatTime } from '../utils/formatters';
import api from '../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const { renderMessage, populateNotificationDetails, setUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchingRef = useRef(false); // Ref to track fetching state

  const fetchNotifications = useCallback(async (page = 1) => {
    if (fetchingRef.current) return; // Avoid multiple fetches

    setLoading(true);
    fetchingRef.current = true; // Set fetching flag to true
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
      const notifications = data.notifications;

      // Populate details for each notification
      const updatedDetails = {};
      for (const notification of notifications) {
        const details = await populateNotificationDetails(notification);
        updatedDetails[notification.id] = details;
      }

      setNotificationDetails((prev) => ({ ...prev, ...updatedDetails }));
      setNotifications((prev) => (page === 1 ? notifications : [...prev, ...notifications])); // Append or reset based on page
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      fetchingRef.current = false;
      setTimeout( async () => {
        setLoading(false);
      }, 1000)
    }
  }, [populateNotificationDetails]);

  useEffect(() => {
    setPage(1);
    setNotifications([]); // Clear notifications when navigating back to the page
    fetchNotifications(1); // Fetch first page of notifications
    setUnreadCount(0); // Reset unread count
  }, [fetchNotifications, setUnreadCount]);

  useEffect(() => {
    if (page > 1) {
      fetchNotifications(page); // Fetch subsequent pages when page changes
    }
  }, [page, fetchNotifications]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 10 &&
        !loading &&
        page < totalPages &&
        !fetchingRef.current // Check if not already fetching
      ) {
        setPage((prevPage) => prevPage + 1); // Trigger pagination fetch
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [loading, page, totalPages]);

  const handleProfileNavigate = (e, notification) => {
    e.stopPropagation(); // Prevents navigation on click
    navigate(`/profile/${notification.actorId}`);
  };

  const handleNotificationClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  console.log("Current page", page);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Notifications</h1>
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
            <p className="text-center text-gray-500">No notifications yet</p>
          )}
          {loading && <p className="text-center text-gray-500">Loading more notifications...</p>}
        </div>
      </div>
    </>
  );
};

export default Notifications;
