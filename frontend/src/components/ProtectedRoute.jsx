import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    // You could render a loading spinner here
    return <div className="w-full h-screen flex items-center justify-center">
      <p className="text-xl">Loading...</p>
    </div>;
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If requiredRole is specified and user role doesn't match
  if (requiredRole && currentUser.userType !== requiredRole) {
    // Redirect based on user role
    if (currentUser.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // If everything is okay, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
