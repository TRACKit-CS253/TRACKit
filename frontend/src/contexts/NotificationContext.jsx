import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = useRef({}); // Store all timeout IDs
  const recentNotificationsRef = useRef({}); // For deduplication

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // Deduplicate notifications within a short time window (500ms)
    const notificationKey = `${message}-${type}`;
    const now = Date.now();
    
    if (recentNotificationsRef.current[notificationKey] && 
        now - recentNotificationsRef.current[notificationKey] < 500) {
      // Skip duplicate notification
      return null;
    }
    
    // Record this notification to prevent duplicates
    recentNotificationsRef.current[notificationKey] = now;
    
    const id = `notification-${now}`;
    
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Clear any existing timeout for this ID
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
    }
    
    // Set new timeout and store the ID
    timeoutsRef.current[id] = setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      delete timeoutsRef.current[id];
    }, duration);
    
    return id;
  }, []);
  
  const hideNotification = useCallback((id) => {
    // Clear the timeout for this notification
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
