import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext';
// Import the Calendar component
import MyCalendar from '../../components/Calendar_Dashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Course() {
  const { courses, loading, error } = useCourses();
  // const pastYears = ["2024-25 SEMII", "2024-25 SEMI", "2024-25 SEMII", "2024-25 SEMI", "2024-25 SEMII", "2024-25 SEMI"];
  const navigate = useNavigate();
  const {logout} = useAuth();
  if (loading) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <div className="animate-pulse text-xl">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    // return (
    //   <div className='w-full h-full flex items-center justify-center'>
    //     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    //       <p>Error loading courses: {error}</p>
    //     </div>
    //   </div>
    // );
    logout();
    navigate('/login');
  }

  if (!courses || courses.length === 0) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <div className="bg-gray-100 border border-gray-200 text-gray-700 p-6 rounded text-center">
          <p className="font-semibold text-xl mb-3">No courses available</p>
          <p>You are not enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-evenly'>
      {/* <p className='text-[35px] font-semibold mt-2'>Dashboard</p> */}
      <div className='flex gap-3 mt-4 flex-wrap justify-center'>
        {
          courses.map(course => (
            <NavLink to={`/${course.code}/coursehome`} key={course.id}>
              <div className='cursor-pointer shadow-lg hover:scale-95 transition-all duration-200 h-[130px] w-[180px] border rounded-md flex flex-col items-center justify-evenly p-2'>
                <p className='font-semibold bg-[#D9D9D9] px-5 py-1 rounded-md'>{course.code}</p>
                <p>{course.instructor || 'Faculty'}</p>
                <p className='text-[14px]'>{course.name.length > 14 ? course.name.substring(0, 14) + "..." : course.name}</p>
              </div>
            </NavLink>
          ))
        }
      </div>

      {/* Replace the iframe with MyCalendar component */}
      <div className='w-[97%] m-auto h-[72%] border rounded-lg shadow-xl my-3 bg-white p-4'>
        <MyCalendar />
      </div>

      {/* <div className='flex gap-3 w-[92%] justify-evenly items-center mb-6 flex-wrap'>
        {
          pastYears.map((year, index) => (
            <div 
              key={index}
              className='bg-white border cursor-pointer py-3 px-6 rounded-lg shadow-lg hover:scale-95 transition-all duration-200 hover:bg-blue-500 hover:text-white'
            >
              {year}
            </div>
          ))
        }
      </div> */}
    </div> 
  );
}