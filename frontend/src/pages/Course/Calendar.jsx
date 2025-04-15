import React, { useState, useEffect } from 'react';
import { CgProfile } from "react-icons/cg";
import { useCourse } from '../../contexts/CourseContext';
import MyCalendar from '../../components/Calendar_Course';
import { NavLink } from 'react-router-dom';
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { MdOutlineViewDay, MdViewWeek, MdCalendarViewMonth } from "react-icons/md";

export default function Calendar() {
  const { courseDetails, loading, error } = useCourse();
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', or 'month'
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  // Close the view menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isViewMenuOpen && !event.target.closest('.view-menu-container')) {
        setIsViewMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isViewMenuOpen]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl font-medium text-gray-700">Loading calendar...</p>
      </div>
    );
  }
  
  if (error || !courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Couldn't Load Calendar</h2>
          <p className="text-gray-600 mb-6">{error || "Course details could not be loaded"}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <NavLink 
              to="/dashboard/courses"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Courses
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  const getViewModeIcon = () => {
    switch(viewMode) {
      case 'day': return <MdOutlineViewDay className="text-blue-600" />;
      case 'week': return <MdViewWeek className="text-blue-600" />;
      case 'month': return <MdCalendarViewMonth className="text-blue-600" />;
      default: return <MdCalendarViewMonth className="text-blue-600" />;
    }
  };
  
  const getViewModeText = () => {
    switch(viewMode) {
      case 'day': return 'Day View';
      case 'week': return 'Week View';
      case 'month': return 'Month View';
      default: return 'Month View';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white bg-opacity-70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Course Calendar</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails.code}</span>
                  <span className="text-gray-500 text-sm">{courseDetails.credits} Credits • {courseDetails.semester}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <NavLink 
                to="/dashboard/profile"
                className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                title="View Profile"
              >
                <CgProfile className="text-2xl text-gray-700" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          
          {/* Calendar Component */}
          <div className="p-4 md:p-6">
            <MyCalendar view={viewMode} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        /* Modal backdrop styles for future modal implementations */
        .modal-backdrop {
          @apply fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md z-[100];
        }
        
        .modal-content {
          @apply z-[101];
        }
      `}</style>
    </div>
  );
}