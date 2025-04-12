import React, { useState, useEffect } from 'react';
import DashBoardMenu from '../../components/DashBoardMenu';
import Course from './Course';
import { Route, Routes } from 'react-router-dom';
import Profile from './Profile';
import Performance from './Performance';
import ContactUs from './ContactUs';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons for menu toggle

export default function Dashboard(props) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  return (
    <div className='h-screen w-full flex items-center bg-[#F5F5F5] overflow-scroll'>
      {/* Menu toggle button for small dimensions */}
      <button 
        onClick={toggleMenu}
        className={`fixed top-4 left-4 z-20 md:hidden bg-blue-500 text-white p-2 rounded-md shadow-lg`}
      >
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Dashboard menu with responsive behavior */}
      <div 
        className={`fixed h-[98%] transition-all duration-300 ease-in-out z-10 my-1
        ${isMenuOpen ? 'left-0 w-[85%] md:w-[19%]' : '-left-full md:left-0 md:w-[19%]'}
        ${isMobile ? 'bg-white shadow-lg ml-0' : 'ml-1'}`}
      >
        <DashBoardMenu />
      </div>

      {/* Main content area that adjusts based on menu state */}
      <div 
        className={`transition-all duration-300 ease-in-out z-0 h-full
        ${isMenuOpen ? 'ml-[20%]' : 'ml-0 md:ml-[20%]'} 
        ${isMobile && isMenuOpen ? 'opacity-30' : 'opacity-100'}
        w-full`}
      >
        <Routes>
          <Route path="/courses" element={<Course course={props.course}></Course>}></Route>
          <Route path="/performance" element={<Performance/>}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
          <Route path="/contactus" element={<ContactUs/>}></Route>
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
  )
}
