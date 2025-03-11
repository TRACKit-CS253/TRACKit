import React, { useState } from 'react'
import { CgProfile } from 'react-icons/cg'
import lecturesData from './Lecture_Data.js'
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

export default function Lectures({ role }) {
  const [expandedWeeks, setExpandedWeeks] = useState({});
  
  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  function editHandler(e) {
    e.stopPropagation();
    console.log("Edit");
  }

  function deleteHandler(e) {
    e.stopPropagation();
    console.log("Delete");
  }

  function downloadHandler(e, lectureId) {
    e.stopPropagation();
    console.log("Download PDF for lecture", lectureId);
    // Here you would implement actual PDF download functionality
    // For example: window.open(`/api/lectures/${lectureId}/download`, '_blank');
  }

  function addLectureHandler() {
    console.log("Add Lecture");
  }

  return (
    <div className='w-full h-screen overflow-y-auto'>
      <div className='flex justify-between p-3 px-8 items-center sticky top-0 bg-[#F5F5F5] shadow-lg'>
        <p className='text-[32px] uppercase font-semibold m-4'>Lectures</p>
        <div className='flex items-center gap-4'>
          {role !== "student" && (
            <button className='bg-blue-500 shadow-xl text-white py-2 px-4 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'>
              <FaPlus className='text-[18px]' />
              <p>Add Lecture</p>
            </button>
          )}
          <NavLink to="/dashboard/profile">
            <CgProfile className='text-[40px] cursor-pointer hover:text-blue-500 duration-200 transition-all' />
          </NavLink>
        </div>
      </div>

      <div className='p-6'> 
        {lecturesData.map((week) => (
          <div key={week.id} className='mb-6'>
            <div 
              className='w-[97%] py-3 ml-6 border-2 flex flex-col px-8 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200'
              onClick={() => toggleWeek(week.id)}
            >
              <div className='flex justify-between w-full font-semibold'>
                <span className='text-lg'>{week.title}</span>
                <IoIosArrowDropdown 
                  className={`text-[25px] transform transition-transform duration-500 ${
                    expandedWeeks[week.id] ? 'rotate-180' : ''
                  }`}
                />
              </div>
            
            
            {/* Week content */}
            <div 
              className={`overflow-hidden transition-all duration-500 ${
                expandedWeeks[week.id] ? 'max-h-[1000px] opacity-100 py-3' : 'max-h-0 opacity-0'
              }`}
            >
              {week.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="mb-4">
                  <h3 className="font-medium text-lg mb-2">{topic.title}</h3>
                  
                  {topic.lectures.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="ml-4 mb-2 flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <span>{lecture.title}</span>
                      
                      <div className='flex gap-4 items-center'>
                        <button 
                          onClick={(e) => downloadHandler(e, lecture.id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:underline"
                        >
                          <FaFilePdf className="text-red-500" />
                          <FaDownload className="text-[14px]" />
                        </button>
                        
                        {role !== "student" && (
                          <div className='flex gap-2 items-center'>
                            <button onClick={editHandler}>
                              <FaRegEdit className='text-[18px]' />
                            </button>
                            <button onClick={deleteHandler}>
                              <AiOutlineDelete className='text-[18px] text-red-600' />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}