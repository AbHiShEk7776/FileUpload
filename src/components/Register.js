import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      console.log('Registration Successful', response.data);
      // Redirect to login
    } catch (error) {
      console.error('Error registering', error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-teal-400">
      <form className="bg-white p-10 rounded-2xl shadow-lg w-96 transition-transform duration-300 hover:scale-105" onSubmit={handleRegister}>
        <h1 className="text-3xl text-teal-600 text-center font-semibold mb-8">Register</h1>
        <div className="mb-5">
          <label className="block text-teal-600 mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200"
            placeholder="Enter your name"
          />
        </div>
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
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-3 rounded-md hover:bg-teal-600 transition duration-200"
        >
          Register
        </button>
        <p className="text-center mt-4 text-gray-700">
          Already have an account? <Link to="/login" className="text-teal-500 underline">Login here</Link>
        </p>
      </form>
    </div>
  );
};
export default Register;
