// src/components/Navbar.js

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    navigate('/login'); // Redirect to login page after logout
  };

  const handleLogin = () => {
    navigate('/login'); // Redirect to login page
  };

  const handleRegister = () => {
    navigate('/'); // Redirect to register page
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 shadow-lg flex justify-between items-center">
      <h2 className="text-white text-2xl font-bold">Contact Book</h2>
      <ul className="flex space-x-4">
        {location.pathname === '/login' ? (
          <li>
            <button
              onClick={handleRegister}
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition duration-300"
            >
              Register
            </button>
          </li>
        ) : location.pathname === '/' ? (
          <li>
            <button
              onClick={handleLogin}
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition duration-300"
            >
              Login
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition duration-300"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
