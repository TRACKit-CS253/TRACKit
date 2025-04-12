import React, { useEffect, useState } from 'react';
import CourseMenu from '../../components/CourseMenu';
import { Routes, Route, useParams } from 'react-router-dom';
import CourseHome from './CourseHome';
import Lectures from './Lectures';
import Announcements from './Announcements';
import Forum from './Forum';
import Results from './Results';
import Calendar from './Calendar';
import { useCourses } from '../../contexts/CourseContext';
import { SingleCourseProvider } from '../../contexts/CourseContext';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons for menu toggle

export default function Courses({ role, courseCode }) {
  // Add state for menu visibility and mobile detection
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Add debugging
  useEffect(() => {
    console.log("Courses component rendering:", { role, courseCode });
  }, [role, courseCode]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close menu on mobile when resizing
      if (mobile) {
        setIsMenuOpen(false);
      } else {
        setIsMenuOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  if (!courseCode) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          Error: No course code provided
        </div>
      </div>
    );
  }
  
  return (
    <SingleCourseProvider courseCode={courseCode}>
      <div className='w-full flex bg-[#F5F5F5] h-full'>
        <button 
          onClick={toggleMenu}
          className={`fixed top-7 -left-1 z-20 md:hidden bg-blue-500 text-white p-2 rounded-md shadow-lg`}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        
        <div 
          className={`fixed h-[98%] transition-all duration-300 ease-in-out z-10 mt-2
          ${isMenuOpen ? 'left-0 w-[85%] md:w-[19%]' : '-left-full md:left-0 md:w-[19%]'}
          ${isMobile ? 'bg-white shadow-lg ml-0' : 'ml-1'}`}
        >
          <CourseMenu courseCode={courseCode} />
        </div>
        
        <div 
          className={`transition-all duration-300 ease-in-out z-0 h-full w-full
          ${isMenuOpen ? 'md:ml-[20%]' : 'ml-0 md:ml-[20%]'} 
          ${isMobile && isMenuOpen ? 'opacity-30' : 'opacity-100'}`}
        >
          <Routes>
            <Route path="/" element={<CourseHome present={19} total={20} role={role} />} />
            <Route path="coursehome" element={<CourseHome present={19} total={20} role={role} />} />
            <Route path="lectures" element={<Lectures role={role} />} />
            <Route path="announcements" element={<Announcements role={role} />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="result" element={<Results />} />
            <Route path="forum" element={<Forum role={role} />} />
          </Routes>
        </div>
        
        {/* Overlay to close menu when clicking outside on mobile */}
        {isMobile && isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-5"
            onClick={toggleMenu}
          />
        )}
      </div>
    </SingleCourseProvider>
  );
}
