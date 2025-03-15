import React from 'react';
import { CgProfile } from "react-icons/cg";
import student from '../../assets/student.png';
import faculty from '../../assets/faculty.png';
import addCourse from "../../assets/addCourse.png";
import cntDev from "../../assets/ContactDeveloper.png";
import manageUser from "../../assets/manageUsers.png";
import manageCourse from "../../assets/manageCourse.png";
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  const handleAddStudentClick = () => {
    navigate('/admin/add-student');
  };

  const handleAddFacultyClick = () => {
    navigate('/admin/add-faculty');
  };

  const handleCreateCourseClick = () => {
    navigate('/admin/create-course');
  };
  return (
    <div className='bg-[#F5F5F5] h-screen w-full'>
      <nav className='flex justify-between p-5'>
        <p className='text-[33px] font-semibold ml-3'>TRACKit</p>
        <p className='text-[33px] font-semibold'>Welcome System Admin: IIT Kanpur</p>
        <CgProfile className='text-[45px] m-2 '></CgProfile>
      </nav>

  
      <div className='w-full'>
        <div className='w-10/12 m-auto grid grid-cols-3'>
          <div className='m-auto my-8'>
            <img src={student} alt="" className="cursor-pointer" />
            <p 
              className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'
              onClick={handleAddStudentClick}
            >
              Add Student
            </p>
          </div>
          <div className='m-auto mb-8'>
            <img src={faculty} alt="" className="cursor-pointer" />
            <p 
              className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'
              onClick={handleAddFacultyClick}
            >
              Add Faculty
            </p>
          </div>
          <div className='m-auto mb-8'>
            <img src={addCourse} alt="" className="cursor-pointer" />
            <p 
              className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'
              onClick={handleCreateCourseClick}
            > 
              Create Courses
            </p>
          </div>
          <div className='m-auto mb-8'>
            <img src={manageCourse} alt="" className="cursor-pointer" />
            <p className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'>
              Manage Courses
            </p>
          </div>
          <div className='m-auto mb-8'>
            <img src={manageUser} alt="" className="cursor-pointer" />
            <p className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'>
              Manage Users
            </p>
          </div>
          <div className='m-auto mb-8'>
            <img src={cntDev} alt="" className="cursor-pointer" />
            <p className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer'>
              Contact Developers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}