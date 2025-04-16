const axios = require('axios');

// Configuration
const API_URL = 'http://172.27.16.252:3001/api/admin/course'; // Adjust the endpoint if needed
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlclR5cGUiOiJhZG1pbiIsImlhdCI6MTc0Mzg3MDA0MywiZXhwIjoxNzQzODczNjQzfQ.ue4JQfRwB8TouELZK3nCjxKibNikxnHO6VXRgWVDeQc'; // Replace with a valid admin token

// Generate random course data
const generateCourseData = (index) => {
  const semesters = ['Fall', 'Spring', 'Summer']; // Valid semesters
  return {
    code: `COURSE${index}`,
    name: `Course Name ${index}`,
    description: `This is the description for Course ${index}`,
    department: `Department ${index % 10}`, // Rotate between 10 departments
    credits: (index % 5) + 1, // Random credits between 1 and 5
    instructor: `Instructor ${index}`,
    semester: semesters[index % semesters.length], // Rotate between Fall, Spring, and Summer
  };
};

// Add a single course
const addCourse = async (courseData) => {
  try {
    const response = await axios.post(API_URL, courseData, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Course ${courseData.code} added successfully:`, response.data);
  } catch (error) {
    console.error(`Error adding course ${courseData.code}:`, error.response?.data || error.message);
  }
};

// Add 10,000 courses
const addCourses = async () => {
  for (let i = 1; i <= 10000; i++) {
    const courseData = generateCourseData(i);
    await addCourse(courseData);
  }
};

// Run the script
addCourses();