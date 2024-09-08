// AuthenticatedLayout.js
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AuthenticatedLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Navbar className="bg-gray-900 text-white flex-shrink-0 h-full" />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
