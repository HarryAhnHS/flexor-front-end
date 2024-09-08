import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';
import SearchBar from './Searchbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLayerGroup, faUser, faBell, faSquarePlus, faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'


const Navbar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { unreadCount } = useNotifications();

  // Logout function
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-gray-900 py-6 px-4 text-white flex flex-col space-y-4">
      {/* Logo Container */}
      <div className="flex items-center justify-center text-xl">
        <Link to="/feed" className="font-semibold transition">
              Flexor
        </Link>
      </div>
  
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-shrink-0">
          <SearchBar />
        </div>
  
        {/* Center Section: Links */}
        <div className="text-xl flex-grow flex items-center justify-center space-x-8">
          <Link to="/feed" className="font-semibold hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faHouse} />
          </Link>
          <Link to="/realms" className="font-semibold hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faLayerGroup} />
          </Link>
  
          {/* HeadlessUI Dropdown Menu */}
          <Menu as="div" className="relative">
            <MenuButton className="font-semibold hover:text-gray-400 transition">
              <FontAwesomeIcon icon={faSquarePlus} />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-40 bg-gray-800 rounded shadow-lg py-2">
              <MenuItem>
                <Link
                  to="/submit-post"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  New Post
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/submit-realm"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  New Realm
                </Link>
              </MenuItem>
            </MenuItems>
          </Menu>
  
          {/* Notifications Link */}
          <div className="relative">
            <Link
              to={`/notifications`}
              className="font-semibold hover:text-gray-400 transition"
            >
              <FontAwesomeIcon icon={faBell} />
            </Link>
            {unreadCount !== 0 && (
              <span className="absolute top-[-8px] right-[-12px] w-[15px] h-[15px] rounded-full text-xs text-white bg-red-600 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
  
          {/* Profile Link */}
          <Link
            to={`/profile/${userId}`}
            className="font-semibold hover:text-gray-400 transition"
          >
            <FontAwesomeIcon icon={faUser} />
          </Link>
        </div>
  
        {/* Right Section: Logout Button */}
        <div className="flex-shrink-0 text-xl">
          <button onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </div>
    </nav>
  );
}
  
  export default Navbar;  
