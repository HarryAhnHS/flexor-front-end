import { useNotifications } from '../contexts/NotificationsContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotificationsPage = () => {
  const { notifications, notificationDetails, renderMessage, removeNotification } = useNotifications();

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {notifications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map((notification) => {
              const details = notificationDetails[notification.id];
              const message = renderMessage(notification);
              return (
                <div key={notification.id} className="border p-4 rounded-md shadow-md flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm mb-2">{message}</p>
                    {details && details.link && (
                      <Link to={details.link} className="text-blue-500 hover:underline">
                        View Details
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Dismiss
                  </button>
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

export default NotificationsPage;