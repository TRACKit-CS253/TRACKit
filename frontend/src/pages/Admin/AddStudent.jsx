import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import axios from 'axios'; 
export default function AddStudent() {
  const [studentData, setStudentData] = useState({
    userId: '',
    courseId: ''
  });
  const [buttonClicked, setButtonClicked] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage or any other storage mechanism
      console.log('Token:', token);
      const response = await axios.post('http://localhost:3001/api/courses/add-student', studentData, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the request headers
        }
      });
      console.log('Response:', response.data);
      setButtonClicked(true);
      setSuccessMessage('Student has been added to the course successfully.');
      setTimeout(() => {
        navigate('/admin'); // Navigate back to the admin page after form submission
      }, 1000); // Delay to show the button color change
    } catch (error) {
      console.error('Error adding student to course:', error);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <nav className="flex justify-between p-5">
        <p className="text-[33px] font-semibold ml-3">TRACKit</p>
        <p className="text-[33px] font-semibold">Welcome System Admin: IIT Kanpur</p>
        <CgProfile className="text-[45px] m-2" />
      </nav>
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Add Student to Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">User ID:</label>
              <input
                type="text"
                name="userId"
                value={studentData.userId}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Course ID:</label>
              <input
                type="text"
                name="courseId"
                value={studentData.courseId}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={`${
                  buttonClicked ? 'bg-blue-500' : 'bg-[#D9D9D9]'
                } hover:bg-[#4A90E2] text-black font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                Add Student to Course
              </button>
            </div>
          </form>
          {successMessage && (
            <div className="mt-4 text-green-500 text-center">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}