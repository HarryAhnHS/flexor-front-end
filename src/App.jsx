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


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated on component mount
    checkAuth().then(isAuth => setIsAuthenticated(isAuth));
  }, []);

  if (isAuthenticated === null) {
    return (
    <div>
      Loading...
    </div>
      ); // Or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Routes for authenticated users */}
        <Route
          path="/profile/:userId"
          element={isAuthenticated ? <ProfilePage/> : <Navigate to="/login" />}
        />
        <Route
          path="/submit-realm/:realmId?"
          element={isAuthenticated ? <RealmForm/> : <Navigate to="/login" />}
        />
        <Route
          path="/submit-post/:postId?"
          element={isAuthenticated ? <PostForm/> : <Navigate to="/login" />}
        />
        <Route
          path="/realms"
          element={isAuthenticated ? <Realms/> : <Navigate to="/login" />}
        />
        <Route
          path="/realms/:realmId"
          element={isAuthenticated ? <Realm /> : <Navigate to="/login" />}
        />
        <Route
          path="/posts/:postId"
          element={isAuthenticated ? <Post /> : <Navigate to="/login" />}
        />
        <Route
          path="/feed"
          element={isAuthenticated ? <Feed /> : <Navigate to="/login" />}
        />

        {/* User list routes */}
        <Route path="/posts/:id/liked" element={<Users scenario="likedPost" />} />
        <Route path="/comments/:id/liked" element={<Users scenario="likedComment" />} />
        <Route path="/realms/:id/joined" element={<Users scenario="joinedRealm" />} />
        <Route path="/users/:id/followers" element={<Users scenario="followers" />} />
        <Route path="/users/:id/following" element={<Users scenario="following" />} />

        {/* Routes for unauthenticated users */}
        <Route path="/" element={<UnauthenticatedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Catch-all route for handling invalid routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;