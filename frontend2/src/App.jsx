import "./App.css";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Course/Courses";

function App() {

  const role = "student";

  const courses = [
    {code: 'EE320', name: 'Digital Signal Processing', prof:"Abhishek Gupta"},
    {code: 'CS330', name: 'Operating Systems', prof:"Mainak Chaudhuri"},
    {code: 'CS340', name: 'Computer Networks', prof:"Manindra Agrawal"},
    {code: 'CS345', name: 'Database Systems', prof:"Arnab Bhattacharya"},
    {code: 'CS253', name: 'Software Development', prof:"Amey Karkare"},
    {code: 'EE370', name: 'Digital Electronics', prof:"Shubham Sahay"},
  ];

  return (
    <div >
      <Routes>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/admin" element={<Admin></Admin>}></Route>
        <Route path="/dashboard/*" element={<Dashboard course={courses}></Dashboard>}></Route>
        {
          courses.map(course=>(
            <Route path={`/${course.code}/*`} element={<Courses role={role} course={course.code}></Courses>}></Route>
          ))
        }
        {/* <Route path="/courses/*" element={<Courses role={role} course={courses}></Courses>}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
