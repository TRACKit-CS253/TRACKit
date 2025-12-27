import axiosInstance from '../utils/axiosInstance';

export const checkUsername = async (username) => {
  try {
    const response = await axiosInstance.post('/auth/check-username', { username });
    return response.data;
  } catch (error) {
    throw new Error('Failed to check username');
  }
};
