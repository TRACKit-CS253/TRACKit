import React from 'react'
import { useState, useEffect } from 'react';
import { FaRegUser, FaRegBookmark } from "react-icons/fa";
import { PiGraduationCap } from "react-icons/pi";
import { GrDocumentPerformance } from "react-icons/gr";
import { RiCustomerService2Line } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi"; 
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

export default function DashBoardMenu() {
    const [activeTab, setActiveTab] = useState('courses');
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const tabs = [
      { 
        id: 'courses', 
        label: 'My Courses', 
        icon: <PiGraduationCap className="text-lg" /> , 
        link: "/dashboard/courses"
      },
      { 
        id: 'performance', 
        label: 'Performance', 
        icon: <GrDocumentPerformance className="text-lg" />, 
        link: "/dashboard/performance" 
      },
      { 
        id: 'profile', 
        label: 'Profile', 
        icon: <FaRegUser className="text-lg" />, 
        link: "/dashboard/profile" 
      },
      { 
        id: 'contact', 
        label: 'Contact Us', 
        icon: <RiCustomerService2Line className="text-lg" />, 
        link: "/dashboard/contactus" 
      },
    ];

    const filteredTabs = userData.userType === 'faculty' 
      ? tabs.filter(tab => tab.id !== 'performance')
      : tabs;

    // Update activeTab based on current URL path when component mounts or location changes
    useEffect(() => {
      const currentPath = location.pathname;
      
      // Find which tab corresponds to the current path
      const currentTab = filteredTabs.find(tab => currentPath.includes(tab.id) || 
                                        (tab.id === 'contact' && currentPath.includes('contactus')));
      
      if (currentTab) {
        setActiveTab(currentTab.id);
      }
    }, [location.pathname, filteredTabs]);

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    // Format name for display
    const displayName = userData?.firstName && userData?.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData?.username || 'User';
    
    // Determine user role for display
    const userRole = userData?.userType === 'student'
      ? 'Student'
      : userData?.userType === 'faculty'
        ? 'Faculty'
        : 'User';

    return (
      <div className='w-full h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100'>
        {/* Brand header */}
        <div className="px-5 py-6">
          <NavLink 
            to="/dashboard/courses" 
            onClick={() => setActiveTab("courses")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text text-3xl font-bold hover:opacity-90 transition-all"
          >
            TRACKit
          </NavLink>
        </div>
        
        {/* User profile summary */}
        <div className="px-5 py-4 mb-2">
          <NavLink 
            to="/dashboard/profile"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-300"
          >
            <div className="bg-blue-100 p-2 rounded-full">
              {userData?.userType === 'student' 
                ? <PiGraduationCap className="text-blue-600 text-xl" />
                : <FaRegUser className="text-blue-600 text-xl" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </NavLink>
        </div>
        
        {/* Navigation menu */}
        <div className="px-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
          <nav className="space-y-1">
            {filteredTabs.map(tab => (
              <NavLink 
                to={tab.link} 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={({isActive}) => `
                  flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-gray-500'}>{tab.icon}</span>
                <span>{tab.label}</span>
                
                {/* Indicator for active tab */}
                {activeTab === tab.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* Recent courses section - only for students */}
          {userData.userType === 'student' && (
            <div className="mt-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Recent Courses</p>
              
              <div className="space-y-1">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 py-2 px-4 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50"
                  >
                    <FaRegBookmark className="text-blue-500" />
                    <span className="text-sm truncate">Course {i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with logout */}
        <div className="px-4 py-4 mt-auto border-t border-gray-100">
          <div className="flex items-center justify-between px-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-gray-500">Online</span>
            </div>
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all duration-200
                text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            <FiLogOut className="text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
}
