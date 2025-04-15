import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus, FaRegEdit, FaCalendarAlt, FaChalkboardTeacher } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { NavLink } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import MyCalendar from '../../components/Calendar_Course_Home';
import { TbPercentage } from "react-icons/tb";
import { MdOutlineDescription } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";

export default function CourseHome({ role }) {
  const { courseDetails, loading, error } = useCourse();
  const { showNotification } = useNotification();
  const [expandedIndices, setExpandedIndices] = useState({});
  const [courseDescriptions, setCourseDescriptions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [descriptionToDelete, setDescriptionToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    courseDescriptionEntryHeading: '',
    courseDescriptionEntryBody: ''
  });
  const [currentDescriptionId, setCurrentDescriptionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Attendance data state
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const userType = userData?.userType || '';
  const rollNumber = userData?.rollNumber || userData?.student?.rollNumber;

  useEffect(() => {
    if (courseDetails?.id && courseDetails?.code && role === "student" && rollNumber) {
      getAttendanceData();
    }
  }, [courseDetails, role, rollNumber]);
  
  // Function to check if cached data exists and is valid
  const getAttendanceData = () => {
    if (!rollNumber) {
      setAttendanceError("Roll number not available");
      return;
    }
    
    // Check if we have cached attendance data for this course
    const cachedAttendanceData = localStorage.getItem(`attendance_${courseDetails.code}_${rollNumber}`);
    
    if (cachedAttendanceData) {
      try {
        const { data, timestamp } = JSON.parse(cachedAttendanceData);
        
        // Check if the data is less than 1 hour old
        const currentTime = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (currentTime - timestamp < oneHourInMs) {
          console.log("Using cached attendance data");
          setAttendanceData(data);
          return;
        } else {
          console.log("Cached attendance data expired, fetching new data");
        }
      } catch (err) {
        console.error("Error parsing cached attendance data:", err);
      }
    }
    
    // If no valid cached data, fetch new data
    fetchAttendanceData();
  };
  
  const fetchAttendanceData = async () => {
    if (!rollNumber) {
      setAttendanceError("Roll number not available");
      return;
    }
    
    setAttendanceLoading(true);
    setAttendanceError(null);
    
    try {
      const proxyUrl = `${process.env.REACT_APP_API_URL}/api/proxy/attendance`;
      const response = await axios.post(proxyUrl, {
        roll_number: parseInt(rollNumber),
        start_date: "04/01/2025",
        end_date: "today"
      },{
        headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Attendance API response:", response.data);
      
      // Set the fetched data to state
      setAttendanceData(response.data);
      
      // Cache the attendance data in localStorage with timestamp
      const cacheData = {
        data: response.data,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem(`attendance_${courseDetails.code}_${rollNumber}`, JSON.stringify(cacheData));
      console.log(`Attendance data cached for ${courseDetails.code}`);
      
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setAttendanceError("Failed to load attendance data");
      showNotification("Failed to load attendance data", "error");
    } finally {
      setAttendanceLoading(false);
    }
  };
  
  // Manually refresh attendance data button handler
  const handleRefreshAttendance = () => {
    fetchAttendanceData();
    showNotification("Refreshing attendance data...", "info");
  };
  
  // Debug logs
  useEffect(() => {
    console.log("CourseHome rendering with:", { 
      courseDetails, 
      loading, 
      error,
      role,
      attendanceData
    });
  }, [courseDetails, loading, error, role, attendanceData]);
  
  useEffect(() => {
    if (courseDetails?.id) {
      fetchCourseDescriptions();
    }
  }, [courseDetails]);

  const fetchCourseDescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/course-descriptions/course/${courseDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setCourseDescriptions(response.data.data);
      } else {
        showNotification('Failed to fetch course descriptions', 'error');
      }
    } catch (err) {
      console.error('Error fetching course descriptions:', err);
      showNotification('Error loading course descriptions', 'error');
    }
  };
  
  const toggleExpand = (index) => {
    setExpandedIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const addSectionHandler = () => {
    setFormType('create');
    setFormData({
      courseDescriptionEntryHeading: '',
      courseDescriptionEntryBody: ''
    });
    setShowForm(true);
  };
  
  const handleEditClick = (e, description) => {
    e.stopPropagation();
    setFormType('edit');
    setFormData({
      courseDescriptionEntryHeading: description.courseDescriptionEntryHeading,
      courseDescriptionEntryBody: description.courseDescriptionEntryBody
    });
    setCurrentDescriptionId(description.id);
    setShowForm(true);
  };
  
  const handleDeleteClick = (e, description) => {
    e.stopPropagation();
    setDescriptionToDelete(description);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!descriptionToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/course-descriptions/${courseDetails.id}/${descriptionToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        showNotification('Course description entry deleted successfully', 'success');
        setCourseDescriptions(prev => prev.filter(d => d.id !== descriptionToDelete.id));
      } else {
        showNotification('Failed to delete course description entry', 'error');
      }
    } catch (err) {
      console.error('Error deleting course description entry:', err);
      showNotification('Error deleting course description entry', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDescriptionToDelete(null);
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (formType === 'create') {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/course-descriptions`,
          {
            courseId: courseDetails.id,
            courseDescriptionEntryHeading: formData.courseDescriptionEntryHeading,
            courseDescriptionEntryBody: formData.courseDescriptionEntryBody
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          showNotification('Course description entry created successfully', 'success');
          // Refresh descriptions to get the new one with all details
          fetchCourseDescriptions();
        }
      } else if (formType === 'edit') {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/course-descriptions/${courseDetails.id}/${currentDescriptionId}`,
          {
            courseDescriptionEntryHeading: formData.courseDescriptionEntryHeading,
            courseDescriptionEntryBody: formData.courseDescriptionEntryBody
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          showNotification('Course description entry updated successfully', 'success');
          // Update the description in our state
          setCourseDescriptions(prev => 
            prev.map(d => {
              if (d.id === currentDescriptionId) {
                return {
                  ...d,
                  courseDescriptionEntryHeading: formData.courseDescriptionEntryHeading,
                  courseDescriptionEntryBody: formData.courseDescriptionEntryBody,
                  updatedAt: new Date().toISOString()
                };
              }
              return d;
            })
          );
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      showNotification(`Error ${formType === 'create' ? 'creating' : 'updating'} course description entry`, 'error');
    } finally {
      setIsSubmitting(false);
      setShowForm(false);
      setFormData({
        courseDescriptionEntryHeading: '',
        courseDescriptionEntryBody: ''
      });
      setCurrentDescriptionId(null);
    }
  };
  
  const getCourseAttendance = () => {
    if (!attendanceData || !courseDetails?.code) return null;
    
    // Loop through the attendance data to find the matching course code
    // The API returns keys like "EE340 (G-1)" but our courseCode might be just "EE340"
    // So we need to check if the key starts with our course code
    for (const key in attendanceData) {
      if (key === "percentage" || key === "present_classes" || key === "total_classes") {
        continue; // Skip the summary fields
      }
      
      if (key.startsWith(courseDetails.code)) {
        return attendanceData[key];
      }
    }
    
    return null;
  };
  
  const courseAttendance = getCourseAttendance();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Loading course details...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    // Extract course code from URL in case of API error
    const urlParts = window.location.pathname.split('/');
    const courseCodeFromUrl = urlParts[1]; // Get the course code from URL
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <BsInfoCircle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Course</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Retry Loading
                  </button>
                  <NavLink to="/dashboard/courses" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Back to Dashboard
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
          
          {courseCodeFromUrl && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-4">
              <h2 className="text-2xl font-bold mb-2">{courseCodeFromUrl}</h2>
              <p className="text-gray-500 mb-4">Limited view available due to data loading error</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <BsInfoCircle className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">No Course Details</h3>
                <p className="text-yellow-600 mb-4">No course information is available at this time.</p>
                <NavLink to="/dashboard/courses" className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors inline-block text-sm">
                  Back to Courses
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className=" bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 uppercase">{courseDetails.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails.code}</span>
                <span className="text-gray-500 text-sm">{courseDetails.credits} Credits • {courseDetails.semester}</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded capitalize">{JSON.parse(localStorage.getItem('user')).userType}</span>
              </div>
            </div>
            
            <NavLink 
              to="/dashboard/profile"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
              title="View Profile"
            >
              <CgProfile className="text-2xl text-gray-700" />
            </NavLink>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar and Attendance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Calendar section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Course Schedule</h2>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 h-[500px]">
              <MyCalendar />
            </div>
          </div>

          {/* Attendance section */}
          {role === "student" && (
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TbPercentage className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Attendance</h2>
                </div>
                
                {/* Added refresh button for attendance */}
                <button 
                  onClick={handleRefreshAttendance}
                  className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Refresh attendance data"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 h-[80%]">
                {attendanceLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-500">Loading attendance data...</p>
                  </div>
                ) : attendanceError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-3">
                      <BsInfoCircle className="text-red-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Attendance Error</h3>
                    <p className="text-gray-600 mb-4">{attendanceError}</p>
                    <button 
                      onClick={fetchAttendanceData}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : courseAttendance ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Modern Attendance Dashboard */}
                    <div className="w-full max-w-xs relative mb-6">
                      {/* Stylish percentage indicator with glow effect */}
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-md ${
                          courseAttendance.percentage >= 75 
                            ? "bg-green-300/30" 
                            : courseAttendance.percentage >= 65 
                              ? "bg-yellow-300/30" 
                              : "bg-red-300/30"
                        }`}></div>
                        
                        <div className="relative backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-100">
                          <div className="flex flex-col items-center">
                            {/* Attendance Status Badge */}
                            <div className={`px-3 py-0.5 rounded-full text-xs font-medium mb-2 ${
                              courseAttendance.percentage >= 75
                                ? "bg-green-100 text-green-700"
                                : courseAttendance.percentage >= 65
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}>
                              {courseAttendance.percentage >= 75
                                ? "Good Standing"
                                : courseAttendance.percentage >= 65
                                  ? "Warning"
                                  : "Critical"}
                            </div>
                            
                            {/* Attendance Gauge */}
                            <div className="relative w-36 h-36 mb-3">
                              {/* Background Circle */}
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="45" 
                                  fill="none" 
                                  stroke="#f0f0f0"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                
                                {/* Percentage Arc */}
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="45" 
                                  fill="none" 
                                  stroke={courseAttendance.percentage >= 75 ? "#10B981" : courseAttendance.percentage >= 65 ? "#FBBF24" : "#EF4444"} 
                                  strokeWidth="8"
                                  strokeDasharray={`${(courseAttendance.percentage / 100) * 283} 283`}
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                  transform="rotate(-90 50 50)"
                                  className="drop-shadow-md"
                                  style={{
                                    filter: `drop-shadow(0 0 3px ${courseAttendance.percentage >= 75 ? "rgba(16, 185, 129, 0.4)" : courseAttendance.percentage >= 65 ? "rgba(251, 191, 36, 0.4)" : "rgba(239, 68, 68, 0.4)"})`
                                  }}
                                />
                                
                                {/* Center Content */}
                                <foreignObject x="15" y="15" width="70" height="70">
                                  <div className="h-full w-full flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-bold ${
                                      courseAttendance.percentage >= 75
                                        ? "text-green-600"
                                        : courseAttendance.percentage >= 65
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}>
                                      {courseAttendance.percentage.toFixed(0)}%
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Attendance</span>
                                  </div>
                                </foreignObject>
                              </svg>
                              
                              {/* Decorative elements */}
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white"></div>
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-indigo-100 border-2 border-white"></div>
                            </div>
                            
                            {/* Attendance Details */}
                            <div className="text-center space-y-2">
                              <p className="text-gray-700">
                                <span className="font-medium">{courseAttendance.present_classes}</span> classes attended out of <span className="font-medium">{courseAttendance.total_classes}</span>
                              </p>
                              
                              {courseAttendance.percentage < 75 && (
                                <div className={`text-sm ${courseAttendance.percentage >= 65 ? "text-yellow-600" : "text-red-600"} flex items-center justify-center gap-1.5 mt-1`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                  </svg>
                                  <span>
                                    {courseAttendance.percentage < 65 
                                      ? "Attendance critically low" 
                                      : "Attendance below requirement"}
                                  </span>
                                </div>
                              )}

                              {/* Needed to reach 75% */}
                              {courseAttendance.percentage < 75 && (
                                <div className="text-xs bg-gray-50 px-3 py-2 rounded-lg mt-1">
                                  <p>
                                    <span className="font-medium">
                                      {Math.ceil((0.75 * courseAttendance.total_classes - courseAttendance.present_classes) / (1 - 0.75))}
                                    </span> more classes needed to reach 75%
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Last update information */}
                      {localStorage.getItem(`attendance_${courseDetails.code}_${rollNumber}`) && (
                        <p className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                          </svg>
                          Last updated: {new Date(JSON.parse(localStorage.getItem(`attendance_${courseDetails.code}_${rollNumber}`)).timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      )}
                    </div>

                    {/* Refresh Button */}
                    <button 
                      onClick={handleRefreshAttendance}
                      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                        attendanceLoading 
                          ? "bg-gray-100 text-gray-500" 
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                      disabled={attendanceLoading}
                    >
                      <svg 
                        className={`w-4 h-4 ${attendanceLoading ? "animate-spin" : ""}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {attendanceLoading ? "Refreshing..." : "Refresh Attendance"}
                    </button>
                  </div>
                ) : (
                  // Existing code for when no attendance data is available
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
                      <FaChalkboardTeacher className="text-blue-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Attendance Policy</h3>
                    <p className="text-gray-600">This course doesn't have a mandatory attendance policy.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Course Descriptions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdOutlineDescription className="text-green-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Course Details</h2>
            </div>
            
            {role !== "student" && (
              <button 
                onClick={addSectionHandler}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaPlus className="text-sm" />
                <span>Add Section</span>
              </button>
            )}
          </div>
          
          {courseDescriptions.length > 0 ? (
            <div className="space-y-3">
              {courseDescriptions.map((item, index) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleExpand(index)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200"
                >
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer">
                    <h3 className="text-lg font-medium text-gray-800">{item.courseDescriptionEntryHeading}</h3>
                    <div className="flex items-center gap-4">
                      {role !== "student" && (
                        <>
                          <button 
                            onClick={(e) => handleEditClick(e, item)}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <FaRegEdit className="text-blue-600" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, item)}
                            className="p-2 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <AiOutlineDelete className="text-red-600" />
                          </button>
                        </>
                      )}
                      <div className={`transform transition-transform duration-300 ${expandedIndices[index] ? 'rotate-180' : ''}`}>
                        <IoIosArrowDropdown className="text-gray-500 text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`px-6 pb-4 transition-all duration-300 overflow-hidden ${
                      expandedIndices[index] 
                        ? 'max-h-[500px] opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                    style={{ maxHeight: expandedIndices[index] ? '500px' : '0', opacity: expandedIndices[index] ? 1 : 0 }}
                  >
                    <p className="text-gray-600">{item.courseDescriptionEntryBody}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No course descriptions available for this course.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-[201]" data-modal-backdrop="true">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md z-[201]">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this course description entry?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDescriptionToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Description Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-[201]" data-modal-backdrop="true">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl z-[201]">
            <h3 className="text-lg font-bold mb-4">
              {formType === 'create' ? 'Create New Course Description' : 'Edit Course Description'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-1">
                  Description Heading
                </label>
                <input
                  id="heading"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.courseDescriptionEntryHeading}
                  onChange={(e) => setFormData({...formData, courseDescriptionEntryHeading: e.target.value})}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                  Description Body
                </label>
                <textarea
                  id="body"
                  className="w-full p-2 border border-gray-300 rounded h-40"
                  value={formData.courseDescriptionEntryBody}
                  onChange={(e) => setFormData({...formData, courseDescriptionEntryBody: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      courseDescriptionEntryHeading: '',
                      courseDescriptionEntryBody: ''
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : formType === 'create' ? 'Post Description' : 'Update Description'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Standardized modal backdrop transitions */
        .fixed.inset-0.bg-gray-900,
        .fixed.inset-0.bg-black,
        [data-modal-backdrop="true"],
        #file-download-backdrop {
          transition: opacity 150ms ease-out;
        }
        
        /* Ensure all blur effects have the same duration and timing */
        .backdrop-blur-md,
        .backdrop-blur-sm,
        .backdrop-blur-lg {
          transition: backdrop-filter 150ms ease-out;
        }
      `}</style>
    </div>
  );
}