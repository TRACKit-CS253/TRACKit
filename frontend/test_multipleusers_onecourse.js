const axios = require('axios');

// Configuration
const API_URL = 'http://172.27.16.252:3001'; // Base API URL
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlclR5cGUiOiJhZG1pbiIsImlhdCI6MTc0Mzg3MDA0MywiZXhwIjoxNzQzODczNjQzfQ.ue4JQfRwB8TouELZK3nCjxKibNikxnHO6VXRgWVDeQc'; // Replace with a valid admin token
const COURSE_ID = 1; // Replace with the ID of the course to which users will be assigned

// Axios instance with authorization header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Fetch all users
const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data.data; // Assuming the API returns users in `data`
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    return [];
  }
};

// Assign a single user to a course
const assignUserToCourse = async (courseId, userId) => {
  try {
    const response = await axiosInstance.post('/api/courses/add-student', {
      courseId,
      userId,
    });
    console.log(`User ${userId} assigned to course ${courseId}:`, response.data);
  } catch (error) {
    console.error(
      `Error assigning user ${userId} to course ${courseId}:`,
      error.response?.data || error.message
    );
  }
};

// Assign multiple users to a course
const assignUsersToCourse = async () => {
  const users = await fetchUsers();

  // Filter only students from the list of users
  const students = users.filter((user) => user.userType === 'student');

  console.log(`Found ${students.length} students. Assigning them to course ${COURSE_ID}...`);

  for (const student of students) {
    await assignUserToCourse(COURSE_ID, student.id);
  }

  console.log('All students have been assigned to the course.');
};

// Run the script
assignUsersToCourse();