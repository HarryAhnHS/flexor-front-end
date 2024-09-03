import { useNotifications } from '../contexts/NotificationsContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatTime } from '../utils/formatters';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, notificationDetails, renderMessage, refetchNotifications } = useNotifications();

  useEffect(() => {
    // Fetch the latest notifications when the page loads
    refetchNotifications();
  }, [refetchNotifications]);

  const handleProfileNavigate = (e, notification) => {
    e.stopPropagation(); // Prevents navigation on click
    navigate(`/profile/${notification.actorId}`);
  }

  const handleNotificationClick = (link) => {
    if (link) {
      navigate(link);
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Notifications</h1>
        {notifications.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {notifications.map((notification) => {
              const details = notificationDetails[notification.id];
              const message = renderMessage(notification);
              const link = details.link ? details.link : '#';

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
                      {details.source && (
                        <span 
                          className="italic text-gray-600 truncate max-w-[200px]"
                        >
                          &nbsp;&#x2018;{details.source}&#x2019;
                        </span>
                      )}
                    </p>
                    <p className='text-sm mb-2 text-gray'>{formatTime(notification.createdAt)}</p>
                  </div>


                  {/* Source Image */}
                  {details.image && (
                    <img
                      src={details.image}
                      alt="Source"
                      className="w-16 h-16 object-cover ml-4"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No notifications yet</p>
        )}
      </div>
    </>
  );
};

export default Notifications;
