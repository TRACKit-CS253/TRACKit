import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

export default function Course() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/courses');
        setCourses(response.data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const pastYears = ["2024-25 SEMII", "2024-25 SEMI", "2024-25 SEMII", "2024-25 SEMI", "2024-25 SEMII", "2024-25 SEMI"];

  return (
    <div className='w-full h-full flex flex-col items-center justify-evenly'>
      <p className='text-[35px] font-semibold mt-2'>Dashboard</p>
      <div className='flex gap-3 mt-4'>
        {courses.map(course => (
          <NavLink to={`/${course.code}/coursehome`} key={course.code}>
            <div className='cursor-pointer shadow-lg hover:scale-95 transition-all duration-200 h-[130px] w-[180px] border rounded-md flex flex-col items-center justify-evenly p-2'>
              <p className='font-semibold bg-[#D9D9D9] px-5 py-1 rounded-md'>{course.code}</p>
              <p>{course.prof}</p>
              <p className='text-[14px]'>{course.name.substring(0, 14) + "..."}</p>
            </div>
          </NavLink>
        ))}
      </div>

      <iframe src="https://calendar.google.com/calendar/embed?height=550&wkst=1&ctz=Asia%2FKolkata&mode=WEEK&showTz=0&showTitle=0&showPrint=0&src=dmVkdmlzaHdha2FybWEyMjZAZ21haWwuY29t&src=ZW4uaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%230B8043" className='w-[92%] m-auto h-[520px] border rounded-lg shadow-xl'></iframe>

      <div className='flex gap-3 w-[92%] justify-evenly items-center mb-6'>
        {pastYears.map(year => (
          <div key={year} className='bg-white border cursor-pointer py-3 px-6 rounded-lg shadow-lg hover:scale-95 transition-all duration-200 hover:bg-blue-500 hover:text-white'>{year}</div>
        ))}
      </div>
    </div>
  );
}
