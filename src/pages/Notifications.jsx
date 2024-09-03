import { useNotifications } from '../contexts/NotificationsContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatTime } from '../utils/formatters';

const Notifications = () => {
  const { notifications, notificationDetails, renderMessage, removeNotification } = useNotifications();

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
              const link = details && details.link ? details.link : '#';

              return (
                <Link 
                  to={link}
                  key={notification.id}
                  className="flex items-center p-4 bg-white border border-gray-200 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  {details && details.image && (
                    <img
                      src={details.image}
                      alt="Notification"
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-base mb-2">{message}</p>
                    <p className='text-sm mb-2 text-gray'>{formatTime(notification.createdAt)}</p>
                    {details && details.link && (
                      <p className="text-blue-500 hover:underline">
                        View Details
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();  // Prevent navigation when dismissing
                      removeNotification(notification.id);
                    }}
                    className="ml-4 py-2 px-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    Dismiss
                  </button>
                </Link>
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