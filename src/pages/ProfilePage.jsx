import { useEffect, useState } from 'react';
import api from '../services/api'; // Import the custom Axios instance

import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile meta', error);
        setError('Failed to fetch profile meta');
      }
    };
    fetchData();
  }, []);

  console.log(profile);
  return (
    <>
      <Navbar />
      <div>
        {error && <div className="text-red-500">{error}</div>}
        <h1>Hi this is your profile</h1>

      </div>
    </>
  );
};

export default ProfilePage;