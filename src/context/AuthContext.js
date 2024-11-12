// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct the import for jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token'); // Use sessionStorage instead of localStorage

    if (token) {
      try {
        // Decode the token and check if it's valid
        const decodedToken = jwtDecode(token);

        // Check if the token has expired (expiration in seconds, so * 1000 for milliseconds)
        const isTokenExpired = decodedToken.exp * 1000 < Date.now();

        if (!isTokenExpired) {
          // Token is valid, set authentication to true
          setIsAuthenticated(true);
        } else {
          // Token is expired, set authentication to false
          setIsAuthenticated(false);
          sessionStorage.removeItem('token'); // Optionally remove the invalid token
        }
      } catch (error) {
        // Error in decoding, likely an invalid token
        console.error("Invalid token", error);
        setIsAuthenticated(false);
        sessionStorage.removeItem('token'); // Optionally remove the invalid token
      }
    } else {
      // No token found, user is not authenticated
      setIsAuthenticated(false);
    }
    setLoading(false); // Loading is complete
  }, []);

  const login = (token) => {
    // Save token to sessionStorage for session-based persistence
    sessionStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('token'); // Clear the token from sessionStorage on logout
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
