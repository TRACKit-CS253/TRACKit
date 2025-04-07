import React from 'react';
import { CgProfile } from "react-icons/cg";
import { useCourse } from '../../contexts/CourseContext';
import MyCalendar from '../../components/Calendar_Course';
import { NavLink } from 'react-router-dom';

export default function Calendar() {
  const { courseDetails, loading } = useCourse();
  
  if (loading || !courseDetails) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading course details...
      </div>
    );
  }
  
  return (
    <div className='w-full h-screen bg-gray-50 overflow-y-autobg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='flex justify-between py-2 px-8 items-center shadow-md sticky top-0 bg-[#F5F5F5] z-10'>
        <div>
          <p className='text-[32px] uppercase font-semibold m-4'>Calendar</p>
          <p className='text-gray-600 ml-4 -mt-3'>{courseDetails.code} • {courseDetails.credits} Credits • {courseDetails.semester}</p>
        </div>
        <NavLink to="/dashboard/profile">
          <button className='flex hover:text-blue-700 shadow-lg gap-2 font-semibold text-[18px] justify-center hover:scale-[97%] transition-all duration-200 items-center border rounded-full px-3 py-1'>
            <CgProfile className="text-[35px] cursor-pointer" />
            <p>Profile</p>
          </button>
        </NavLink>
      </div>
      
      <div className="px-10 pt-6 pb-10">
        <MyCalendar />
      </div>
    </div>
  );
}