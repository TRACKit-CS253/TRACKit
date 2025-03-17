import React, { useState } from 'react'
import { CgProfile } from 'react-icons/cg'
import data from './data.js'
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { NavLink } from 'react-router-dom';

export default function CourseHome({ present, total, role }) {
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
    <div className='w-full h-full ml-4'>
      <div className='flex justify-between p-3 px-8 items-center sticky top-0 bg-[#F5F5F5] shadow-lg'>
          <p className='text-[32px] uppercase font-semibold m-4'>Course Home</p>
          <NavLink to="/dashboard/profile">
            <CgProfile className='text-[40px] cursor-pointer hover:scale-95 duration-200 transition-all hover:text-blue-500' />
          </NavLink>
      </div>

      <div className='flex justify-evenly items-center'>
        <div>
          <p className='font-semibold text-[19px] mb-2 mt-4'>New Events</p>
          <iframe 
            src="https://calendar.google.com/calendar/embed?height=400&wkst=1&ctz=Asia%2FKolkata&showPrint=0&mode=AGENDA&showNav=0&showDate=0&showCalendars=0&showTz=0&showTitle=0&src=dmVkdmlzaHdha2FybWEyMjZAZ21haWwuY29t&src=OWYxMWIzMDdjZTFjZTU1OWY3NDUyZTQ3ZWJhNmNkN2JkYjY4ODk1ZjI4MmRkODY0MjIxZjQ4NWM4MzVlNGE4MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4uaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%23E67C73&color=%230B8043" 
            width={`${role=="student" ? 700 : 850}`} 
            height="400" 
            className='shadow-xl border rounded-lg'
          ></iframe>
        </div>

      {
        role=="student" &&
        <div className='border px-6 h-[300px] w-[20%] rounded-lg shadow-lg py-8'>
          <p className='font-semibold text-[22px]'>Your Attendence</p>
          <div>
            <p className='text-[45px]'>{(present/total*100).toFixed(0)}%</p>
            <p className='text-[20px]'>You have attended: <br /> {present}/{total} classes</p>
          </div>
        </div>
      }
      {
        role!="student" &&
        <button className='bg-blue-500 shadow-xl text-white py-2 px-4 mt-4 ml-6 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'><FaPlus className='text-[18px]'></FaPlus><p>Add Section</p></button>
      }
      </div>


      <div className='p-4'>
        {data.map((item, index) => (
          <div key={index} className='mb-2'>
            <div 
              className='w-full py-3 border-2 flex flex-col  m-2 px-6 rounded-xl cursor-pointer'>
              <div className='flex justify-between w-full font-semibold'>
                {item.title}
                <div className=' flex gap-8 items-center'>
                {
                  role!="student" &&
                  <div className='flex gap-2 items-center'>
                    <button onClick={editHandler}><FaRegEdit className='text-[22px] hover:scale-105 transition-all duration-200 hover:shadow-lg'></FaRegEdit></button>
                    <button onClick={deleteHandler}><AiOutlineDelete className='text-[22px] text-red-600 hover:scale-105 duration-200 transition-all hover:shadow-lg'></AiOutlineDelete></button>
                  </div>
                  
                }
                <IoIosArrowDropdown onClick={() => toggleExpand(index)}
                  className={`text-[25px] transform transition-transform hover:scale-105 hover:shadow-xl duration-500 ${expandedIndices[index] ? 'rotate-180' : ''}`}
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
  )
}
