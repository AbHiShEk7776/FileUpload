// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Optionally, show a loading spinner
  }
  console.log('isAuthenticated:', isAuthenticated);
console.log('loading:', loading);
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
