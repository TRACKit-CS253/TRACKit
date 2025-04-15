import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and user data in localStorage on initial load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setToken(token);
      setCurrentUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);
  
  // Function to login user
  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { username, password }
      );
      
      if (response.data && response.data.success && response.data.token) {
        const { token, user } = response.data;
        
        // console.log("Received token:", token);
        // console.log("Storing user data:", user);
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        
        // Also store token in user object for redundancy
        if (user) {
          user.token = token;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Update state
        setToken(token);
        setCurrentUser(user);
        
        return response.data;
      } else {
        console.error("Login response missing token:", response.data);
        throw new Error("Login successful but no token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  // Function to logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
  };
  
  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
