import { Link, useNavigate } from 'react-router-dom'; // For redirecting after logout
import { useNotifications } from '../contexts/NotificationsContext';

const Navbar = () => {
  const navigate = useNavigate(); // For programmatic navigation
  const userId = localStorage.getItem('userId');
  const { unreadCount } = useNotifications();

  // Logout function
  const handleLogout = async () => {
    try {
      // Remove JWT token from local storage
      localStorage.removeItem('token');
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-semibold">
          <Link to="/feed">Posts</Link>
        </div>
        <div className="text-lg font-semibold">
          <Link to="/realms">Realms</Link>
        </div>
        <div className="text-lg font-semibold">
          <Link to="/submit-post">+ Post</Link>
        </div>
        <div className="text-lg font-semibold">
            <Link to="/submit-realm">+ Realm</Link>
        </div>
        <div className="text-lg font-semibold relative">
          <Link to={`/notifications`}>Notifications</Link>
          {unreadCount !== 0 && 
            <span className='absolute top-[-5px] right-[-22px] w-[20px] h-[20px] rounded-full text-sm text-white bg-red-600 flex items-center justify-center'>
              {unreadCount}
            </span>
          }
        </div>
        <div className="text-lg font-semibold">
          <Link to={`/profile/${userId}`}>Profile</Link>
        </div>
        <div>
            <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;