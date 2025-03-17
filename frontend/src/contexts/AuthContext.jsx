import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserProfile, API_URL } from '../services/auth';

// Create auth context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedProfile = localStorage.getItem('userProfile');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
          
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          } else {
            // If we have a user but no profile, and the user is faculty/student, fetch profile
            const user = JSON.parse(storedUser);
            if (['student', 'faculty'].includes(user.userType)) {
              const profileData = await fetchUserProfile(user.userType, user.id, storedToken);
              if (profileData.success) {
                setUserProfile(profileData.data);
                localStorage.setItem('userProfile', JSON.stringify(profileData.data));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        setToken(data.token);
        
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // If user is student or faculty, fetch additional profile data
        if (['student', 'faculty'].includes(data.user.userType)) {
          const profileData = await fetchUserProfile(data.user.userType, data.user.id, data.token);
          if (profileData.success) {
            setUserProfile(profileData.data);
            localStorage.setItem('userProfile', JSON.stringify(profileData.data));
          }
        }
        
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setToken(null);
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
  };

  const value = {
    currentUser,
    userProfile,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
