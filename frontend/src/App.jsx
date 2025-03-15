import "./App.css";
import React, { useState, useEffect } from 'react';
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Course/Courses";
import AddStudent from "./pages/Admin/AddStudent"; // Import AddStudent component

function App() {
  
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user ? user.userType : null; // Add null check for user
  
  const courses = [
    {code: 'EE320', name: 'Digital Signal Processing', prof:"Abhishek Gupta"},
    {code: 'CS330', name: 'Operating Systems', prof:"Mainak Chaudhuri"},
    {code: 'CS340', name: 'Computer Networks', prof:"Manindra Agrawal"},
    {code: 'CS345', name: 'Database Systems', prof:"Arnab Bhattacharya"},
    {code: 'CS253', name: 'Software Development', prof:"Amey Karkare"},
    {code: 'EE370', name: 'Digital Electronics', prof:"Shubham Sahay"},
  ];

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-student" element={<AddStudent />} /> {/* Add route for AddStudent */}
        <Route path="/dashboard/*" element={<Dashboard course={courses} />} />
        {
          courses.map(course => (
            <Route key={course.code} path={`/${course.code}/*`} element={<Courses role={role} course={course.code} />} />
          ))
        }
        {/* <Route path="/courses/*" element={<Courses role={role} course={courses}></Courses>}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
