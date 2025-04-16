const axios = require('axios');

// Configuration
const API_URL = 'http://172.27.16.252:3001/api/admin/user'; // Adjust the endpoint if needed
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlclR5cGUiOiJhZG1pbiIsImlhdCI6MTc0Mzg3MDA0MywiZXhwIjoxNzQzODczNjQzfQ.ue4JQfRwB8TouELZK3nCjxKibNikxnHO6VXRgWVDeQc'; // Replace with a valid admin token

// Generate random user data
const generateUserData = (index) => {
  const userTypes = ['student', 'faculty', 'admin'];
  const userType = userTypes[index % userTypes.length]; // Rotate between user types

  return {
    username: `user${index}`,
    email: `user${index}@example.com`,
    password: 'password123',
    firstName: `FirstName${index}`,
    lastName: `LastName${index}`,
    userType: userType,
    ...(userType === 'student' && {
      rollNumber: `ROLL${index}`,
      enrollmentYear: 2020 + (index % 5), // Random enrollment year between 2020-2024
      major: 'Computer Science',
    }),
    ...(userType === 'faculty' && {
      department: 'Engineering',
      position: 'Professor',
    }),
  };
};

// Add a single user
const addUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`User ${userData.username} added successfully:`, response.data);
  } catch (error) {
    console.error(`Error adding user ${userData.username}:`, error.response?.data || error.message);
  }
};

// Add 100 users
const addUsers = async () => {
  for (let i = 1; i <= 10000; i++) {
    const userData = generateUserData(i);
    await addUser(userData);
  }
};

// Run the script
addUsers();