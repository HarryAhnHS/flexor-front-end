// AuthenticatedLayout.js
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/Searchbar';
import Sidebar from '../components/Sidebar';

const AuthenticatedLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Navbar className="bg-gray-900 text-white flex-shrink-0 h-full" />

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-900 text-white transition-all duration-300">
        {/* Search Bar */}
        <div className='my-4 mx-6 text-white'>
          <SearchBar className="flex-1"/>
        </div>

        {/* Scrollable Content */}
        <div className='bg-gray-900 flex-1 rounded-lg overflow-y-auto'>
          <Outlet />
        </div>
      </div>

      <Sidebar/>
    </div>
  );
};

export default AuthenticatedLayout;
