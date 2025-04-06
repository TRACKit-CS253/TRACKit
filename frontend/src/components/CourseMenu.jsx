import React, { useState } from 'react';
import { IoCalendarNumberOutline } from "react-icons/io5";
import { NavLink, useParams } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { PiGraduationCap } from "react-icons/pi";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineForum } from "react-icons/md";
import { useCourse } from '../contexts/CourseContext';
import { FiLogOut } from "react-icons/fi";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CourseMenu() {
  const { courseCode } = useParams();
  const { courseDetails, loading } = useCourse();
  const [activeTab, setActiveTab] = useState('coursehome');
  const {logout} = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'coursehome', label: 'Course Home', icon: <GoHome className="text-lg" /> , link: `coursehome`},
    { id: 'lectures', label: 'Lectures', icon: <PiGraduationCap className="text-lg" />, link: `lectures` },
    { id: 'announcements', label: 'Announcements', icon: <TfiAnnouncement className="text-lg" />, link: `announcements` },
    { id: 'calendar', label: 'Calendar', icon: <IoCalendarNumberOutline className="text-lg" />, link: `calendar` },
    { id: 'result', label: 'Result', icon: <IoNewspaperOutline className="text-lg" />, link: `result` },
    { id: 'forum', label: 'Forum', icon: <MdOutlineForum className="text-lg" />, link: `forum` },
  ];

  // handler to logout from the application
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='w-full h-full flex flex-col rounded-xl overflow-hidden bg-white shadow-md border border-gray-100'>
      {/* Header section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-6 text-white'>
        <div className="flex items-center gap-4">
          <NavLink 
            to="/dashboard/courses" 
            onClick={() => setActiveTab("courses")}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 flex-shrink-0"
            title="Return to Dashboard"
          >
            <GoHome className="text-xl" />
          </NavLink>
          
          <div className="flex-1 truncate">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-white/30 rounded w-2/3"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            ) : (
              <div>
                <h3 className='font-semibold text-xl truncate'>{courseDetails?.name || courseCode}</h3>
                <p className="text-sm text-white/70 truncate">{courseDetails?.code} • {courseDetails?.credits || "0"} Credits</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation section */}
      <div className='flex-1 overflow-y-auto px-3 py-4'>
        <div className="space-y-1">
          {tabs.map(tab => (
            <NavLink
              to={`/${courseCode}/${tab.link}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={({isActive}) => `
                flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className={`flex items-center justify-center ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* Footer section */}
      <div className='px-3 py-4 mt-auto border-t border-gray-100'>
        <div className="flex items-center justify-between px-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-500">Online</span>
          </div>
          
          <NavLink
            to="/dashboard/profile"
            className="text-xs text-blue-600 hover:underline"
          >
            View Profile
          </NavLink>
        </div>
      
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 w-full py-2.5 px-4 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium"
        >
          <FiLogOut className="text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
