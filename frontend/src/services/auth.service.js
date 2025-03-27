const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const checkUsername = async (username) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    return await response.json();
  } catch (error) {
    throw new Error('Failed to check username');
  }
};
