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
    <div className='w-full h-screen bg-gray-50 overflow-y-auto'>
      <div className='flex justify-between py-2 px-8 items-center shadow-md sticky top-0 bg-[#F5F5F5] z-10'>
        <div>
          <p className='text-[32px] uppercase font-semibold m-4'>Calendar</p>
          <p className='text-gray-600 ml-4 -mt-3'>{courseDetails.code} • {courseDetails.credits} Credits • {courseDetails.semester}</p>
        </div>
        <NavLink to="/dashboard/profile">
          <CgProfile className="text-[40px] cursor-pointer hover:scale-95 transition-all duration-200 hover:text-blue-500" />
        </NavLink>
      </div>
      
      <div className="px-10 pt-6 pb-10">
        <MyCalendar />
      </div>
    </div>
  );
}