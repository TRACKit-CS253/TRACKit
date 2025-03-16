import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Course/Courses";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import AddStudent from "./pages/Admin/AddStudent"; // Import AddStudent component
import AddFaculty from "./pages/Admin/AddFaculty"; // Import AddFaculty component
import CreateCourse from "./pages/Admin/createCourse"; // Import CreateCourse component
// Wrapper component that checks auth status and redirects accordingly
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  
  // Sample course data
  const courses = [
    {code: 'EE320', name: 'Digital Signal Processing', prof:"Abhishek Gupta"},
    {code: 'CS330', name: 'Operating Systems', prof:"Mainak Chaudhuri"},
    {code: 'CS340', name: 'Computer Networks', prof:"Manindra Agrawal"},
    {code: 'CS345', name: 'Database Systems', prof:"Arnab Bhattacharya"},
    {code: 'CS253', name: 'Software Development', prof:"Amey Karkare"},
    {code: 'EE370', name: 'Digital Electronics', prof:"Shubham Sahay"},
  ];
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Default route handler - redirects based on auth status and user role
  const handleDefaultRoute = () => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    if (currentUser.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard/courses" replace />;
    }
  };
  
  return (
    <Routes>
      {/* Default route - redirects based on auth status */}
      <Route path="/" element={handleDefaultRoute()} />
      
      {/* Login route - accessible only when not logged in */}
      <Route 
        path="/login" 
        element={currentUser ? handleDefaultRoute() : <Login />} 
      />
      
      {/* Admin routes - protected for admin users only */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-student" element={<AddStudent />} /> {/* Add route for AddStudent */}
        <Route path="/admin/add-faculty" element={<AddFaculty />} />
        <Route path="/admin/create-course" element={<CreateCourse />} />
      </Route>
      {/* Dashboard routes - protected for any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={<Dashboard course={courses} />} />
        
        {/* Course routes */}
        {courses.map(course => (
          <Route 
            key={course.code}
            path={`/${course.code}/*`}
            element={<Courses role={currentUser?.userType} course={course.code} />}
          />
        ))}
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
