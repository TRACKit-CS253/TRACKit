import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus, FaRegEdit, FaChalkboardTeacher } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { NavLink } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import MyCalendar from '../../components/Calendar_Course_Home';
import { TbPercentage } from "react-icons/tb";
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
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const userType = userData?.userType || '';
  const rollNumber = userData?.rollNumber || userData?.student?.rollNumber;

  useEffect(() => {
    if (courseDetails?.id && courseDetails?.code && role === "student" && rollNumber) {
      getAttendanceData();
    }
  }, [courseDetails, role, rollNumber]);
  
  /**
   * Checks if there is valid cached attendance data and uses it, 
   * otherwise fetches new data from API
   */
  const getAttendanceData = () => {
    if (!rollNumber) {
      setAttendanceError("Roll number not available");
      return;
    }
    
    // Try to get cached data for this specific course and student
    const cacheKey = `attendance_${courseDetails.code}_${rollNumber}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        const oneHourMs = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Check if cached data is still valid (less than 1 hour old)
        if (currentTime - timestamp < oneHourMs) {
          console.log("Using cached attendance data from local storage");
          setAttendanceData(data);
          setLastUpdated(new Date(timestamp));
          return;
        } else {
          console.log("Cached attendance data expired, fetching fresh data");
        }
      } catch (err) {
        console.error("Error parsing cached attendance data:", err);
        // Continue to fetch new data if there's an error with cached data
      }
    } else {
      console.log("No cached attendance data found, fetching from API");
    }
    
    // No valid cache found, fetch fresh data
    fetchAttendanceData();
  };
  
  const fetchAttendanceData = async () => {
    if (!rollNumber || !courseDetails?.code) {
      setAttendanceError("Required data not available");
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
      
      // Store the current timestamp
      const now = new Date();
      setLastUpdated(now);
      setAttendanceData(response.data);
      
      // Cache the data in localStorage with timestamp
      const cacheData = {
        data: response.data,
        timestamp: now.getTime()
      };
      
      const cacheKey = `attendance_${courseDetails.code}_${rollNumber}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Attendance data cached for ${courseDetails.code}`);
      
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setAttendanceError("Failed to load attendance data");
      showNotification("Failed to load attendance data", "error");
    } finally {
      setAttendanceLoading(false);
    }
  };
  
  // Manually refresh attendance data
  const handleRefreshAttendance = () => {
    fetchAttendanceData();
    showNotification("Refreshing attendance data...", "info");
  };
  
  // Extract attendance data for the current course
  const getCourseAttendance = () => {
    if (!attendanceData || !courseDetails?.code) return null;
    
    // Loop through the attendance data to find the matching course code
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
  
  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="animate-pulse text-xl">Loading course details...</div>
      </div>
    );
  }
  
  if (error) {
    // Extract course code from URL in case of API error
    const urlParts = window.location.pathname.split('/');
    const courseCodeFromUrl = urlParts[1]; // Get the course code from URL
    
    return (
      <div className='w-full p-6'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading course details: {error}</p>
          <p className="mt-2 text-sm">
            Try navigating back to the <NavLink to="/dashboard/courses" className="underline font-medium">dashboard</NavLink> and selecting the course again.
          </p>
        </div>
        
        {courseCodeFromUrl && (
          <div className="bg-white shadow-md rounded p-6 mt-4">
            <h2 className="text-2xl font-bold uppercase mb-2">Course: {courseCodeFromUrl}</h2>
            <p className="text-gray-500 mb-4">Limited view due to data loading error</p>
            
            <div className="mt-4">
              <p className="font-medium">Available actions:</p>
              <ul className="list-disc pl-5 mt-2">
                <li className="mb-1">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-blue-500 underline"
                  >
                    Retry loading course
                  </button>
                </li>
                <li>
                  <NavLink to="/dashboard/courses" className="text-blue-500 underline">
                    Return to courses dashboard
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (!courseDetails) {
    return (
      <div className='w-full p-4'>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No course details available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className='w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='flex justify-between py-2 px-8 items-center sticky top-0 bg-[#F5F5F5] shadow-lg z-50'>
        <div>
          <p className='text-[32px] uppercase font-semibold m-4'>{courseDetails.name}</p>
          <p className='text-gray-600 ml-4 -mt-3'>{courseDetails.code} • {courseDetails.credits} Credits • {courseDetails.semester} • {JSON.parse(localStorage.getItem('user')).userType}</p>
        </div>
        <NavLink to="/dashboard/profile">
          <button className='flex hover:text-blue-700 shadow-lg gap-2 font-semibold text-[18px] justify-center hover:scale-[97%] transition-all duration-200 items-center border rounded-full px-3 py-1'>
            <CgProfile className="text-[35px] cursor-pointer" />
            <p>Profile</p>
          </button>
        </NavLink>
      </div>

      {/* Calendar and Attendance Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6'>
        {/* Calendar section - takes up full width on small screens, 2/3 on large */}
        <div className='lg:col-span-2 ml-4'>
          <p className='font-semibold text-[25px] mb-2 mt-4'>New Events</p>
          <div className='shadow-xl border rounded-lg p-4 bg-white w-full h-[450px] md:h-[500px]'>
            <MyCalendar />
          </div>
        </div>

        {/* Attendance section with caching improvements */}
        {role === "student" && (
          <div className='border px-6 py-8 rounded-lg shadow-lg flex flex-col justify-center lg:h-[300px] mt-10 lg:mt-20 w-full bg-white'>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <TbPercentage className="text-indigo-600 text-xl" />
                </div>
                <p className='font-semibold text-[22px]'>Your Attendance</p>
              </div>
              
              <button
                onClick={handleRefreshAttendance}
                disabled={attendanceLoading}
                className="text-sm p-1.5 rounded-full hover:bg-gray-100 transition-all"
                title="Refresh attendance data"
              >
                <svg className={`w-4 h-4 text-gray-600 ${attendanceLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {attendanceLoading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-2"></div>
                <p className="text-gray-500 text-sm">Loading attendance data...</p>
              </div>
            ) : attendanceError ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-100">
                  <BsInfoCircle className="text-red-500 text-xl" />
                </div>
                <p className="text-red-500 mb-3">{attendanceError}</p>
                <button 
                  onClick={fetchAttendanceData}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : courseAttendance ? (
              <div className="text-center">
                {/* Attendance percentage in a circle */}
                <div className="relative inline-flex mb-4">
                  <svg className="w-28 h-28">
                    {/* Background circle */}
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="50" 
                      fill="none" 
                      stroke="#E5E7EB" 
                      strokeWidth="10"
                    />
                    
                    {/* Foreground circle showing percentage */}
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="50" 
                      fill="none" 
                      stroke={courseAttendance.percentage >= 75 ? "#10B981" : courseAttendance.percentage >= 65 ? "#FBBF24" : "#EF4444"} 
                      strokeWidth="10"
                      strokeDasharray={`${Math.PI * 100}`}
                      strokeDashoffset={`${Math.PI * 100 * (1 - courseAttendance.percentage / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 56 56)"
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      courseAttendance.percentage >= 75 ? "text-green-500" : 
                      courseAttendance.percentage >= 65 ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {courseAttendance.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <p className='text-gray-800 mb-2'>
                  You've attended <span className='font-semibold'>{courseAttendance.present_classes}</span> out of <span className='font-semibold'>{courseAttendance.total_classes}</span> classes
                </p>
                
                {courseAttendance.percentage < 75 && (
                  <p className="flex items-center justify-center gap-1 text-red-500 text-sm font-medium mt-1">
                    <BsInfoCircle /> 
                    <span>Below required 75% attendance</span>
                  </p>
                )}
                
                {/* Show last updated time */}
                {lastUpdated && (
                  <p className="text-xs text-gray-400 mt-4">
                    Last updated: {lastUpdated.toLocaleTimeString()} {lastUpdated.toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                  <FaChalkboardTeacher className="text-blue-500 text-xl" />
                </div>
                <p className="text-gray-600">No attendance policy for this course</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='p-4 mb-10 px-8'>
        <div className='flex justify-between items-center mb-4 pr-6'>
        <h2 className="text-[25px] font-bold ml-2">Course Details</h2>
        {
          role!=="student" &&
          <button 
            onClick={addSectionHandler}
            className='bg-blue-500 shadow-xl text-white py-2 px-4 mt-4 ml-6 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'
          >
            <FaPlus className='text-[18px]'></FaPlus>
            <p>Add Section</p>
          </button>
        }
        </div>
        
        {courseDescriptions.length > 0 ? (
          courseDescriptions.map((item, index) => (
            <div key={item.id} className='mb-2' onClick={() => toggleExpand(index)}>
              <div className='w-full py-3 border-2 flex flex-col m-2 px-6 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all duration-200'>
                <div className='flex justify-between w-full font-semibold'>
                  <span className='text-lg'>{item.courseDescriptionEntryHeading}</span>
                  <div className='flex gap-8 items-center'>
                  {
                    role !== "student" && (
                      <div className='flex gap-2 items-center'>
                        <button onClick={(e) => handleEditClick(e, item)}>
                          <FaRegEdit className='text-[22px] hover:scale-105 transition-all duration-200 hover:shadow-lg'></FaRegEdit>
                        </button>
                        <button onClick={(e) => handleDeleteClick(e, item)}>
                          <AiOutlineDelete className='text-[22px] text-red-600 hover:scale-105 duration-200 transition-all hover:shadow-lg'></AiOutlineDelete>
                        </button>
                      </div>
                    )
                  }
                  <IoIosArrowDropdown 
                    className={`text-[25px] transform transition-transform hover:scale-105 duration-500 ${expandedIndices[index] ? 'rotate-180' : ''}`}
                  />
                  </div>
                </div>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${expandedIndices[index] ? 'max-h-96 opacity-100 py-3' : 'max-h-0 opacity-0'}`}
                >
                  {item.courseDescriptionEntryBody}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No course descriptions available for this course.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
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
    </div>
  );
}