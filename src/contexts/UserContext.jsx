// src/contexts/UserContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [sidebarUser, setSidebarUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await api.get(`/users/${userId}`);
        setSidebarUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateSidebarUser = (updatedUser) => {
    setSidebarUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ sidebarUser, loading, updateSidebarUser }}>
      {children}
    </UserContext.Provider>
  );
};
