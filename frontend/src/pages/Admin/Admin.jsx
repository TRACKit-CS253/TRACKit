import React from 'react';
import { FiLogOut } from "react-icons/fi"; // Logout icon
import student from '../../assets/student.png';
import faculty from '../../assets/faculty.png';
import addCourse from "../../assets/addCourse.png";
import cntDev from "../../assets/ContactDeveloper.png";
import manageUser from "../../assets/manageUsers.png";
import manageCourse from "../../assets/manageCourse.png";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Assuming logout function is available

  const adminOptions = [
    { id: 1, title: "Add Student", image: student, path: '/admin/add-student' },
    { id: 2, title: "Add Faculty", image: faculty, path: '/admin/add-faculty' },
    { id: 3, title: "Create Courses", image: addCourse, path: '/admin/create-course' },
    { id: 4, title: "Manage Courses", image: manageCourse, path: '/admin/manage-courses' },
    { id: 5, title: "Manage Users", image: manageUser, path: '/admin/manage-users' },
    { id: 6, title: "Contact Developers", image: cntDev, path: '/admin/contact-developers' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className='bg-[#F5F5F5] h-screen w-full'>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white p-8 shadow-lg z-10 flex justify-between items-center">
        <span 
          className="text-4xl font-semibold cursor-pointer" 
          onClick={() => navigate("/admin")}
        >
          TRACKit
        </span>
        <h1 className="text-2xl font-semibold text-gray-700">Welcome System Admin</h1>
        <div className="flex items-center gap-6">
          <FiLogOut 
            className="text-[35px] text-red-500 cursor-pointer hover:text-red-600 transition-all" 
            onClick={logout} 
          />
        </div>
      </div>

      {/* Add padding to the main content to prevent overlap with the fixed header */}
      <div className="pt-[100px]">
        {/* Main Content */}
        <div className='w-full'>
          <div className='w-10/12 m-auto grid grid-cols-3'>
            {adminOptions.map((option) => (
              <div key={option.id} className='m-auto my-8'>
                <img src={option.image} alt={option.title} className="cursor-pointer" />
                <p 
                  className='bg-[#D9D9D9] w-11/12 m-auto text-center py-[12px] font-semibold mt-2 rounded-md hover:bg-[#3B82F6] hover:text-white transition-all duration-200 cursor-pointer hover:scale-95'
                  onClick={() => handleNavigation(option.path)}
                >
                  {option.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
