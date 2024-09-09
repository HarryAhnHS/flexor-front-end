import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';
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
import { faMicroblog } from '@fortawesome/free-brands-svg-icons';

const Navbar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { unreadCount } = useNotifications();

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
    <nav className='bg-gray-900 text-white flex flex-col h-full py-4 transition-all duration-300 border-r border-gray-700'>
      {/* Logo Container */}
      <div className="mt-2 text-md font-bold md:text-2xl">
        <Link to="/feed" className="transition flex justify-center items-center">
          <span className='font-bold text-indigo-500'>flex</span>or
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-gray-700 my-4"></div>

      {/* Navigation Items */}
      <div className="flex flex-col flex-grow mx-8">
        {/* Menu Items */}
        <div className="flex flex-col space-y-6">
          <Link to="/feed" className="h-8 flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faHouse} />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link to="/realms" className="h-8 flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faLayerGroup} />
            <span className="hidden md:inline">Realms</span>
          </Link>

          {/* Dropdown Menu for Creating Content */}
          <Menu as="div" className="relative">
            <MenuButton className="h-8 flex items-center space-x-4 hover:text-gray-400 transition">
              <FontAwesomeIcon icon={faSquarePlus} />
              <span className="hidden md:inline">Create</span>
            </MenuButton>
            <MenuItems className="absolute left-0 mt-2 w-40 bg-gray-800 rounded shadow-lg py-2 border border-gray-700 z-50">
              <MenuItem>
                <Link
                  to="/submit-post"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 space-x-2"
                >
                  <FontAwesomeIcon icon={faMicroblog} />
                  <span>New Post</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/submit-realm"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 space-x-2"
                >
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <span>New Realm</span>
                </Link>
              </MenuItem>
            </MenuItems>
          </Menu>

          {/* Notifications */}
          <div className="relative flex items-center">
            <Link to="/notifications" className="h-8 flex items-center space-x-4 hover:text-gray-400 transition">
              <div className='relative'>
                <FontAwesomeIcon icon={faBell} />
                {unreadCount !== 0 && (
                  <span className="absolute top-[-10px] right-[-12px] w-4 h-4 rounded-full text-xs text-white bg-red-600 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Notifications</span>
            </Link>
          </div>

          {/* Profile */}
          <Link to={`/profile/${userId}`} className="h-8 flex items-center space-x-4 hover:text-gray-400 transition">
            <FontAwesomeIcon icon={faUser} />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-gray-700 my-4"></div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mx-8 h-8 flex items-center space-x-4 hover:text-gray-400 transition mb-4"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        <span className="hidden md:inline">Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;