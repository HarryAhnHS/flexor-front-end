// AuthenticatedLayout.js
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/Searchbar';

const AuthenticatedLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Navbar className="bg-gray-900 text-white flex-shrink-0 h-full" /> {/* Add width as needed */}

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Search Bar */}
        <div className='my-4 mx-6 text-white'>
          <SearchBar className="flex-1"/>
        </div>

        {/* Scrollable Content */}
        <div className='bg-gray-900 flex-1 rounded-lg overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
