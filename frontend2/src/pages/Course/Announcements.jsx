import React, { useState } from 'react'
import { CgProfile } from 'react-icons/cg'
import data from './data2.js'
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { NavLink } from 'react-router-dom';

export default function Announcements({ role }) {
  const [expandedIndices, setExpandedIndices] = useState({});
  
  const toggleExpand = (index) => {
    setExpandedIndices(prev => ({ ...prev, [index]: !prev[index] }));
  };

  function editHandler() {
    console.log("Edit");
  }

  function deleteHandler() {
    console.log("Delete");
  }

  return (
    <div className='w-full h-screen overflow-y-auto'>
      <div className='flex justify-between p-3 px-8 shadow-lg items-center sticky top-0 bg-[#F5F5F5]'>
        <p className='text-[32px] uppercase font-semibold m-4'>Announcements</p>
        <div className='flex items-center gap-4'>
          {role !== "student" && (
            <button className='bg-blue-500 shadow-xl text-white py-2 px-4 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'>
              <FaPlus className='text-[18px]' />
              <p>Add Announcement</p>
            </button>
          )}
          <NavLink to="/dashboard/profile">
            <CgProfile className='text-[40px] cursor-pointer hover:text-blue-500 duration-200 transition-all' />
          </NavLink>
        </div>
      </div>

      <div className='p-6 '> 
        {data.map((item, index) => (
          <div key={index} className='mb-2' onClick={() => toggleExpand(index)}>
            <div className='w-[98%] py-3 ml-6 border-2 flex flex-col px-8 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200'>
              <div className='flex justify-between w-full font-semibold'>
                <span className='text-lg'>{item.title}</span> {/* Increased text size */}
                <div className='flex gap-8 items-center'>
                  {role !== "student" && (
                    <div className='flex gap-2 items-center'>
                      <button onClick={editHandler}>
                        <FaRegEdit className='text-[22px] hover:scale-110 transition-all duration-200' />
                      </button>
                      <button onClick={deleteHandler}>
                        <AiOutlineDelete className='text-[22px] text-red-600 hover:scale-110 transition-all duration-200' />
                      </button>
                    </div>
                  )}
                  <IoIosArrowDropdown 
                    className={`text-[25px] transform transition-transform duration-500 hover:scale-110 ${
                      expandedIndices[index] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
              <div 
              className={`overflow-hidden transition-all duration-300  ${expandedIndices[index] ? 'max-h-40 opacity-100 py-3' : 'max-h-0 opacity-0'}`}
            >
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}