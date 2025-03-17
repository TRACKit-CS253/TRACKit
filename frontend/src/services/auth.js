export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Fetch user profile data (student/faculty)
export const fetchUserProfile = async (userType, id, token) => {
  try {
    const response = await fetch(`${API_URL}/api/${userType}/${id}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, message: 'Network error' };
  }
};

// Helper function to make authenticated requests
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  return fetch(`${API_URL}${url}`, mergedOptions);
};
