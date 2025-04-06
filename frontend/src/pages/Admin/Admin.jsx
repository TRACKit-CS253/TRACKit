import React from 'react';
import { FaUserGraduate, FaUsersCog, FaRegUser  } from "react-icons/fa";
import { GiSpellBook, GiTeacher, GiNotebook } from "react-icons/gi";
import { MdOutlineEngineering } from "react-icons/md";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const adminOptions = [
    { id: 1, title: "Add Student", image: <FaUserGraduate size={100} className='text-orange-500'/>, path: '/admin/add-student' },
    { id: 2, title: "Add Faculty", image: <GiTeacher size={100} className='text-gray-700'/>, path: '/admin/add-faculty' },
    { id: 3, title: "Create Courses", image: <GiSpellBook size={100} className='text-blue-700'/>, path: '/admin/create-course' },
    { id: 4, title: "Manage Courses", image: <GiNotebook size={100} className='text-yellow-500'/>, path: '/admin/manage-courses' },
    { id: 5, title: "Manage Users", image: <FaUsersCog size={100} className='text-violet-600'/>, path: '/admin/manage-users' },
    { id: 6, title: "Contact Developers", image: <MdOutlineEngineering size={100} className='text-red-800'/>, path: '/admin/contact-developers' }
  ];

  return (
    <div className='w-screen h-screen bg-gradient-to-br from-pink-100 via-white to-indigo-100 p-6 overflow-y-auto'>
      <div className='max-w-[1200px] m-auto'>
      <header className="flex items-center justify-between px-4">
        <div className="text-[3rem] font-bold text-slate-900">TRACKit</div>
        <button className='flex hover:scale-[97%] items-center gap-2 border rounded-full px-5 py-2 shadow-sm bg-white hover:bg-red-50 transition-all duration-200'>
          <span>
            <FaRegUser size={20} className='text-red-600'></FaRegUser>
          </span>
          <span className='text-lg font-semibold' onClick={logout}>Sign Out</span>
        </button>
      </header>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Welcome System Admin</h2>
      </div>

      <div>
        <div className='w-full'>
          <div className='w-10/12 m-auto grid lg:grid-cols-3 md:grid-cols-2'>
            {adminOptions.map((option) => (
              <div key={option.id} className='m-auto gap-4 flex flex-col items-center justify-center rounded-xl my-8 shadow-xl
               border h-[200px] aspect-square hover:scale-[98%] duration-200 transition-all' onClick={() => navigate(option.path)}>
                <div>
                  {option.image}
                </div>
                <div className='font-semibold text-lg'>{option.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
