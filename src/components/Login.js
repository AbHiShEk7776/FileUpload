import React, { useState } from 'react';
import{ useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
const Login = ({ setToken }) => {
    const{ login }=useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      sessionStorage.removeItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log('Login Successful', response.data);
      sessionStorage.setItem('token', response.data.token);
        login(response.data.token);
      // Redirect to the contacts page after successful login
      navigate('/contacts');
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-teal-400">
      <form className="bg-white p-10 rounded-2xl shadow-lg w-96 transition-transform duration-300 hover:scale-105" onSubmit={handleLogin}>
        <h1 className="text-3xl text-teal-600 text-center font-semibold mb-8">Login</h1>
        <div className="mb-5">
          <label className="block text-teal-600 mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-5">
          <label className="block text-teal-600 mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
            placeholder="Enter your password"
          />
        </div>
        {errorMessage && <div className="text-red-500 mb-4 text-center">{errorMessage}</div>}
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-3 rounded-md hover:bg-teal-600 transition duration-200"
        >
          Login
        </button>
        <p className="text-center mt-4 text-gray-700">
          Don't have an account? <Link to="/" className="text-teal-500 underline">Register here</Link>
        </p>
      </form>
    </div>
  );
};
export default Login;
