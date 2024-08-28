import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { checkAuth } from './services/checkAuth'; // A utility function to check if user is logged in

import UnauthenticatedPage from './pages/UnauthenticatedPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import NewRealmPage from './pages/NewRealmPage';
import NewPostPage from './pages/NewPostPage';


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
        {/* Routes for authenticated users */}
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage/> : <Navigate to="/login" />}
        />
        <Route
          path="/new-realm"
          element={isAuthenticated ? <NewRealmPage/> : <Navigate to="/login" />}
        />
        <Route
          path="/new-post"
          element={isAuthenticated ? <NewPostPage/> : <Navigate to="/login" />}
        />

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