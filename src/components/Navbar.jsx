import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';
import SearchBar from './Searchbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faLayerGroup,
  faUser,
  faBell,
  faSquarePlus,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

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
    <nav className="bg-gray-900 text-white flex flex-col h-full w-64 py-4">
      {/* Logo Container */}
      <div className="mb-8 text-2xl font-bold flex justify-center">
        <Link to="/feed" className="hover:text-gray-400 transition">
          Flexor
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col flex-grow">
        {/* Search */}
        <div className="flex items-center mb-6 px-3 space-x-2 hover:text-gray-400 transition">
          <SearchBar />
          <span className="hidden md:inline">Search</span>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col space-y-4">
          <Link to="/feed" className="flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faHouse} />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link to="/realms" className="flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faLayerGroup} />
            <span className="hidden md:inline">Realms</span>
          </Link>

          {/* Dropdown Menu for Creating Content */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center space-x-4 hover:text-gray-400 transition">
              <FontAwesomeIcon icon={faSquarePlus} />
              <span className="hidden md:inline">Create</span>
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg py-2">
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

          {/* Notifications */}
          <div className="relative flex items-center">
            <Link to="/notifications" className="flex items-center space-x-4 hover:text-gray-400 transition">
              <FontAwesomeIcon icon={faBell} />
              <span className="hidden md:inline">Notifications</span>
            </Link>
            {unreadCount !== 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full text-xs text-white bg-red-600 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Profile */}
          <Link to={`/profile/${userId}`} className="flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faUser} />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-700 my-4"></div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-4 hover:text-gray-400 transition mb-4"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        <span className="hidden md:inline">Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;
