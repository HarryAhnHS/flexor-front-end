import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { checkAuth } from './services/checkAuth'; // A utility function to check if user is logged in

import UnauthenticatedPage from './pages/UnauthenticatedPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
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
import 'react-toastify/dist/ReactToastify.css'; // Import CSS here

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated on component mount
    checkAuth().then(isAuth => setIsAuthenticated(isAuth));
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Routes for unauthenticated users */}
        <Route path="/" element={<UnauthenticatedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            <Route
              path="/profile/:userId"
              element={
                <NotificationsProvider>
                  <ProfilePage />
                </NotificationsProvider>
              }
            />
            <Route
              path="/submit-realm/:realmId?"
              element={
                <NotificationsProvider>
                  <RealmForm />
                </NotificationsProvider>
              }
            />
            <Route
              path="/submit-post/:postId?"
              element={
                <NotificationsProvider>
                  <PostForm />
                </NotificationsProvider>
              }
            />
            <Route
              path="/realms"
              element={
                <NotificationsProvider>
                  <Realms />
                </NotificationsProvider>
              }
            />
            <Route
              path="/realms/:realmId"
              element={
                <NotificationsProvider>
                  <Realm />
                </NotificationsProvider>
              }
            />
            <Route
              path="/posts/:postId"
              element={
                <NotificationsProvider>
                  <Post />
                </NotificationsProvider>
              }
            />
            <Route
              path="/feed"
              element={
                <NotificationsProvider>
                  <Feed />
                </NotificationsProvider>
              }
            />
            <Route
              path="/notifications"
              element={
                <NotificationsProvider>
                  <Notifications />
                </NotificationsProvider>
              }
            />

            {/* User list routes */}
            <Route 
              path="/posts/:id/liked" 
              element={
                <NotificationsProvider>
                  <Users scenario="likedPost" />  
                </NotificationsProvider>
              } 
            />
            <Route 
              path="/comments/:id/liked" 
              element={
                <NotificationsProvider>
                  <Users scenario="likedComment" />
                </NotificationsProvider>
              } 
            />
            <Route 
              path="/realms/:id/joined" 
              element={
                <NotificationsProvider>
                  <Users scenario="joinedRealm" />
                </NotificationsProvider>
              } 
            />
            <Route 
              path="/users/:id/followers" 
              element={
                <NotificationsProvider>
                  <Users scenario="followers" />
                </NotificationsProvider>
              } 
            />
            <Route 
              path="/users/:id/following" 
              element={
                <NotificationsProvider>
                  <Users scenario="following" />
                </NotificationsProvider>
              } 
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* Catch-all route for handling invalid routes */}
        <Route path="*" element={<NotFoundPage />} />
        
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
