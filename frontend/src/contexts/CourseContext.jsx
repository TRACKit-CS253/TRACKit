import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';  // Import the auth context

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user from auth context
  const { currentUser } = useAuth();
  
  // Reset courses when user changes (including logout)
  useEffect(() => {
    console.log("User changed, resetting courses");
    setCourses([]);
    setError(null);
    setLoading(true);
  }, [currentUser?.id]);  // Dependency on user ID
  
  // Fetch courses when user is available
  useEffect(() => {
    const fetchCourses = async () => {
      // If no user is logged in, don't fetch courses
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching courses for user:", currentUser.id);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.id}/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          console.log("Courses fetched successfully:", response.data.data);
          setCourses(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
        setCourses([]); // Clear courses on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [currentUser]); // Re-run when currentUser changes
  
  const value = {
    courses,
    loading,
    error
  };
  
  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

// Individual course context for course-specific pages
const SingleCourseContext = createContext();

export const useCourse = () => useContext(SingleCourseContext);

export const SingleCourseProvider = ({ children, courseCode }) => {
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { courses } = useCourses();
    
    useEffect(() => {
      const getCourseDetails = async () => {
        try {
          setLoading(true);
          
          if (!courseCode) {
            console.error("No courseCode provided");
            setError("Course code is missing");
            setLoading(false);
            return;
          }
          
          console.log(`Fetching details for course: ${courseCode}`);
          
          // First try to find the course in existing courses array
          const foundCourse = courses.find(course => course.code === courseCode);
          
          if (foundCourse) {
            console.log("Found course in existing data:", foundCourse);
            setCourseDetails(foundCourse);
            setLoading(false);
            return;
          }
          
          // If not found in existing courses, fetch from API
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // The key fix - use a better endpoint structure
          // First try the user-specific course endpoint
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.id) {
            throw new Error('User information not found');
          }
          
          try {
            // First try getting all courses for user to find this specific one
            const userCoursesResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/users/${user.id}/courses`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (userCoursesResponse.data.success) {
              const courseFromUserCourses = userCoursesResponse.data.data.find(
                c => c.code === courseCode
              );
              
              if (courseFromUserCourses) {
                console.log("Found course in user's courses:", courseFromUserCourses);
                setCourseDetails(courseFromUserCourses);
                setLoading(false);
                return;
              }
            }
          } catch (userCoursesError) {
            console.error("Error fetching user courses:", userCoursesError);
            // Continue to try the direct course endpoint
          }
          
          // As a fallback, try the direct course endpoint
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/courses/${courseCode}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
              console.log("Course details from API:", response.data.data);
              setCourseDetails(response.data.data);
            } else {
              throw new Error(`Failed to fetch details for ${courseCode}`);
            }
          } catch (directCourseError) {
            console.error("Error fetching course directly:", directCourseError);
            throw directCourseError;
          }
        } catch (err) {
          console.error("Error getting course details:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      getCourseDetails();
    }, [courseCode, courses]);
    
    const value = {
      courseDetails,
      loading,
      error
    };
    
    return (
      <SingleCourseContext.Provider value={value}>
        {children}
      </SingleCourseContext.Provider>
    );
  };