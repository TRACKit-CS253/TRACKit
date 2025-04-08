import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext';
import MyCalendar from '../../components/Calendar_Dashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBook, FaUserGraduate, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { BiChevronRight } from 'react-icons/bi';
import axiosInstance from '../../utils/axiosInstance';

export default function Course() {
  const { courses, loading, error } = useCourses();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [courseDetails, setCourseDetails] = useState({});
  
  // Get current semester based on current date
  const getCurrentSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Assuming January-June is Semester 2 and July-December is Semester 1 of the next academic year
    return month < 6 
      ? `${year-1}-${year} Semester II` 
      : `${year}-${year+1} Semester I`;
  };
  
  const currentSemester = getCurrentSemester();

  // Fetch faculty details for all courses
  useEffect(() => {
    if (courses && courses.length > 0) {
      const fetchFacultyForCourses = async () => {
        try {
          const courseDetailsObj = {};
          
          for (const course of courses) {
            const response = await axiosInstance.get(`/api/courses/${course.id}`);
            const facultyList = response.data.data.faculty || [];
            
            const facultyNames = facultyList.map(faculty => 
              `${faculty.user.firstName} ${faculty.user.lastName}`
            );
            
            courseDetailsObj[course.id] = {
              facultyNames: facultyNames.length > 0 ? facultyNames : ['No faculty assigned']
            };
          }
          
          setCourseDetails(courseDetailsObj);
        } catch (error) {
          console.error("Error fetching faculty details:", error);
        }
      };
      
      fetchFacultyForCourses();
    }
  }, [courses]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    logout();
    navigate('/login');
    return null;
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 rounded-full p-5">
              <FaBook className="text-4xl text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Courses Available</h2>
          <p className="text-gray-600 mb-6">You are not enrolled in any courses for the current semester.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
              <p className="text-gray-600 mt-1">{currentSemester}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <FaUserGraduate className="text-blue-500" />
                <span className="text-sm font-medium">View Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaBook className="text-blue-500" />
            <span>Current Enrollment</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course, index) => (
              <NavLink to={`/${course.code}/coursehome`} key={course.id} className="block group">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 h-full transform group-hover:-translate-y-1">
                  <div className={`h-2 bg-gradient-to-r from-blue-500 to-blue-600`}></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-lg">
                        {course.code}
                      </span>
                      <span className="text-xs text-gray-500">{course.credits} Credits</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 h-12">
                      {course.name}
                    </h3>
                    
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUserGraduate className="text-gray-400 mr-2" />
                        <span className="truncate">
                          {courseDetails[course.id]?.facultyNames?.[0] || 'Loading faculty...'}
                        </span>
                      </div>
                      
                      {courseDetails[course.id]?.facultyNames?.length > 1 && (
                        <div className="mt-1 ml-6 text-xs text-gray-500">
                          +{courseDetails[course.id].facultyNames.length - 1} more faculty
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <FaClock className="text-gray-400 mr-2" />
                        <span>{course.schedule || 'Schedule not available'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <span className="text-blue-500 flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                        View Course <BiChevronRight className="ml-1" size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <span>Upcoming Events</span>
          </h2>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div>
              <MyCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}