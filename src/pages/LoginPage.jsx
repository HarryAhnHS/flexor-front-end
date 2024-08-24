import { useState } from 'react';
import api from '../services/api';
import  {jwtDecode} from 'jwt-decode';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState(""); // State to hold the error message

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await api({
            method: 'post',
            url: `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
            headers: {
              'Content-Type': 'application/json',  // Set the content type header
            },
            data: formData,  // Send the form data as JSON
          });
        if (response.status === 200) {
            const token = response.data.token;
            localStorage.setItem('token', token);
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            localStorage.setItem('userId', userId);
            window.location.href = '/profile'; // Redirect to home page
        }
    } catch (error) {
      console.error('Login failed', error);
      setError('Login failed. Please check your username and password and try again.');
    }
  };

  return (
    <div className="p-4 bg-red-300">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block">Username:</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block">Password:</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display error message if exists */}
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;