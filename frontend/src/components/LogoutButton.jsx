import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = ({ className }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <button 
      onClick={handleLogout} 
      className={`text-red-600 hover:text-red-800 text-[20px] font-semibold ${className || ''}`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
