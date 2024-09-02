// NotificationsList.js
import Navbar from '../components/Navbar';
import { useNotifications } from '../contexts/NotificationsContext';

const Notifications = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
        <Navbar />
        <div className="notifications-list">
        {notifications.slice(0, 10).map((notification) => (
            <div key={notification.id} className="notification-item">
                <p>{notification.type}: {notification.sourceId}</p>
                <button onClick={() => removeNotification(notification.id)}>Dismiss</button>
            </div>
        ))}
        </div>
    </>
  );
};

export default Notifications;
