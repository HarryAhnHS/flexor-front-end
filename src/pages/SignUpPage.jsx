import { useState } from 'react';
import axios from 'axios';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

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
        const response = await axios({
            method: 'post',
            url: `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
            headers: {
              'Content-Type': 'application/json',  // Set the content type header
            },
            data: formData,  // Send the form data as JSON
          });
        if (response.status === 201) {
            window.location.href = '/login'; // Redirect to login page
        }
    } catch (error) {
      console.error('Sign up failed', error);
    }
  };

  return (
    <div className="p-4 bg-red-300">
      <h2 className="text-2xl mb-4">Sign up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label htmlFor="email" className="block">Email:</label>
            <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="border p-2 w-full"
                required
            />
        </div>
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
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block">Confirm Password:</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default SignUpPage;