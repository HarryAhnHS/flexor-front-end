import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { checkAuth } from './services/checkAuth'; // A utility function to check if user is logged in

import UnauthenticatedPage from './pages/UnauthenticatedPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Realms from './pages/Realms';
import Post from './pages/Post';
import Realm from './pages/Realm';
import Feed from './pages/Feed';
import Users from './pages/Users';
import PostForm from './pages/PostForm';
import RealmForm from './pages/RealmForm';
import Notifications from './pages/Notifications';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthenticatedLayout from './contexts/AuthenticatedLayout';
import { UserProvider } from './contexts/UserContext';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated on component mount
    checkAuth().then((isAuth) => setIsAuthenticated(isAuth));
  }, []);

  if (isAuthenticated === null) {
    return <div className='h-screen w-screen bg-gray-900'>
      <div className="flex justify-center items-center h-full">
        <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
        <div className='text-white'>Free plan... Server is waking up...</div>
      </div>
    </div>;
  }

  return (
    <Router>
      <Routes>
        {/* Routes for unauthenticated users */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <UnauthenticatedPage />} />

        {/* Protected routes */}
        {isAuthenticated ? (
          <Route 
            element={
              <NotificationsProvider>
                <UserProvider>
                  <AuthenticatedLayout />
                </UserProvider>
              </NotificationsProvider>
            }
          >
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/submit-realm/:realmId?" element={<RealmForm />} />
              <Route path="/submit-post/:postId?" element={<PostForm />} />
              <Route path="/realms" element={<Realms />} />
              <Route path="/realms/:realmId" element={<Realm />} />
              <Route path="/posts/:postId" element={<Post />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/notifications" element={<Notifications />} />

              {/* User list routes */}
              <Route path="/posts/:id/liked" element={<Users scenario="likedPost" />} />
              <Route path="/comments/:id/liked" element={<Users scenario="likedComment" />} />
              <Route path="/realms/:id/joined" element={<Users scenario="joinedRealm" />} />
              <Route path="/users/:id/followers" element={<Users scenario="followers" />} />
              <Route path="/users/:id/following" element={<Users scenario="following" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}

        {/* Catch-all route for handling invalid routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
