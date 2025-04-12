import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTrashAlt, FaTimes, FaSearch, FaUserEdit, 
  FaUserGraduate, FaChalkboardTeacher, FaPlus, 
  FaRegUser, FaBook
} from "react-icons/fa";
import { GoHome } from "react-icons/go";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/admin/users");
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    
    fetchUsers();
    fetchCourses();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/api/admin/user/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const addstudenttocourse = async (courseId, userId) => {
    try {
      await axiosInstance.post("/api/courses/add-student", {
        courseId,
        userId,
      });

      const response = await axiosInstance.get(`/api/users/${userId}/courses`);
      const updatedCourses = response.data.data;

      setSelectedUser((prev) => ({
        ...prev,
        courses: updatedCourses,
      }));

      setSelectedCourse("");
      setCourseSearchTerm(""); // Clear the search term
      setShowSearchBox(false);

      alert("Student added to course successfully.");
    } catch (error) {
      console.error("Error adding student to course:", error);
      alert("Failed to add student to course.");
    }
  };

  const addfacultytocourse = async (courseId, userId) => {
    try {
      await axiosInstance.post("/api/courses/add-faculty", {
        courseId,
        userId,
      });

      const response = await axiosInstance.get(`/api/users/${userId}/courses`);
      const updatedCourses = response.data.data;

      setSelectedUser((prev) => ({
        ...prev,
        courses: updatedCourses,
      }));

      setSelectedCourse("");
      setCourseSearchTerm(""); // Clear the search term
      setShowSearchBox(false);

      alert("Faculty added to course successfully.");
    } catch (error) {
      console.error("Error adding faculty to course:", error);
      alert("Failed to add faculty to course.");
    }
  };

  const removefacultyfromcourse = async (courseId, userId) => {
    try {
      await axiosInstance.delete(`/api/courses/remove-faculty/${courseId}/${userId}`);

      setSelectedUser((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== courseId),
      }));

      setSelectedCourse("");
    } catch (error) {
      console.error("Error removing faculty from course:", error);
      alert("Failed to remove faculty from course.");
    }
  };

  const removestudentfromcourse = async (courseId, userId) => {
    try {
      await axiosInstance.delete(`/api/courses/remove-student/${courseId}/${userId}`);

      setSelectedUser((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== courseId),
      }));

      setSelectedCourse("");
    } catch (error) {
      console.error("Error removing student from course:", error);
      alert("Failed to remove student from course.");
    }
  };

  const handleInputChange = (key, value) => {
    setSelectedUser((prev) => {
      const updatedUser = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(updatedUser) !== JSON.stringify(prev)); // Compare objects
      return updatedUser;
    });
  };

  const handleNestedInputChange = (nestedKey, key, value) => {
    setSelectedUser((prev) => {
      const updatedUser = {
        ...prev,
        [nestedKey]: { ...prev[nestedKey], [key]: value },
      };
      setHasChanges(JSON.stringify(updatedUser) !== JSON.stringify(prev)); // Compare objects
      return updatedUser;
    });
  };

  const handleSaveChanges = async () => {
    try {
      console.log("Saving user details:", selectedUser);
      await axiosInstance.put(
        `/api/admin/user/${selectedUser.id}`,
        selectedUser
      );
      alert("User details updated successfully.");
      console.log("User details updated successfully:", selectedUser);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, ...selectedUser } : user
        )
      );

      setSelectedUser(null);
      setHasChanges(false); // Reset changes state
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("Failed to update user details.");
    }
  };

  const handleViewDetails = async (user) => {
    try {
      console.log("Fetching courses for user:", user.id);
      const response = await axiosInstance.get(`/api/users/${user.id}/courses`);
      console.log("Courses fetched successfully:", response.data);

      const userCourses = response.data.data;

      setSelectedUser({
        ...user,
        courses: userCourses,
      });
    } catch (error) {
      console.error("Error fetching user courses:", error);
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        alert("You do not have permission to view this user's courses.");
      } else {
        alert("Failed to fetch user courses.");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.id && user.id.toString().includes(searchTerm))
    );
  });

  const labelMapping = {
    id: "ID",
    username: "Username",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    userType: "Role",
    rollNumber: "Roll No",
    major: "Major",
    enrollmentYear: "Enrollment Year",
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen pb-16">
      {/* Fixed Header with glass effect */}
      <div className="fixed top-0 left-0 right-0 py-5 px-8 m-auto z-10 backdrop-blur-md bg-white/70 border-b border-gray-100 shadow-sm">
        <div className='flex justify-between items-center'>
          <div className='flex gap-6 items-center'>
            <motion.span
              className="text-4xl font-semibold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
              onClick={() => navigate("/Admin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              TRACKit 
            </motion.span>
            <motion.div 
              className='cursor-pointer rounded-full bg-gray-50 hover:bg-gray-100 p-3 shadow-sm'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/Admin")}
            >
              <GoHome className='text-[1.5rem] text-gray-700'></GoHome>
            </motion.div>
          </div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text">
            Manage Users
          </h1>
          <motion.button 
            className='flex items-center gap-2 border rounded-full px-5 py-2 shadow-sm bg-white hover:bg-red-50 transition-all duration-200'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
          >
            <span>
              <FaRegUser size={18} className='text-red-500'></FaRegUser>
            </span>
            <span className='font-medium'>Sign Out</span>
          </motion.button>
        </div>
      </div>

      {/* Main content with padding for fixed header */}
      <div className="pt-24 px-8 max-w-7xl mx-auto">
        {/* Search Input */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by ID, name, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </motion.div>

        {/* Users List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      user.userType === 'student' 
                        ? 'bg-blue-100 text-blue-600' 
                        : user.userType === 'faculty' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                    }`}>
                      {user.userType === 'student' 
                        ? <FaUserGraduate size={22} /> 
                        : user.userType === 'faculty' 
                          ? <FaChalkboardTeacher size={22} /> 
                          : <FaUserEdit size={22} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex gap-4 mt-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">Username:</span> {user.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">Role:</span> {user.userType}
                        </p>
                        {user.userType === 'student' && user.student?.rollNumber && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Roll No:</span> {user.student?.rollNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => handleViewDetails(user)}
                      className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaUserEdit size={16} /> View Details
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTrashAlt size={16} /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-500 text-lg">No users found matching your search</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-[40rem] max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit User Details</h2>
              <motion.button
                onClick={() => setSelectedUser(null)}
                className="text-white hover:bg-white/20 p-1.5 rounded-full"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={18} />
              </motion.button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-5">
                {/* Basic User Info Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaUserEdit className="text-blue-600" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(selectedUser)
                      .filter(key => !["student", "faculty", "createdAt", "updatedAt", "courses"].includes(key))
                      .map(key => (
                        <div key={key} className={key === "userType" || key === "id" ? "col-span-2" : ""}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {labelMapping[key] || key}
                          </label>
                          {key === "userType" ? (
                            <select
                              value={selectedUser[key]}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              disabled={key === "id"}
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={selectedUser[key] || ""}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              disabled={key === "id"}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Role-specific Fields */}
                {selectedUser.userType === "student" && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <FaUserGraduate className="text-blue-600" /> Student Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {["rollNumber", "major", "enrollmentYear"].map(field => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {labelMapping[field]}
                          </label>
                          <input
                            type={field === "enrollmentYear" ? "number" : "text"}
                            value={selectedUser.student?.[field] || ""}
                            onChange={(e) => handleNestedInputChange("student", field, e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.userType === "faculty" && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <FaChalkboardTeacher className="text-green-600" /> Faculty Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={selectedUser.faculty?.department || ""}
                          onChange={(e) => handleNestedInputChange("faculty", "department", e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={selectedUser.faculty?.position || ""}
                          onChange={(e) => handleNestedInputChange("faculty", "position", e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Management Section */}
                <div className={`p-4 rounded-lg mb-4 ${
                  selectedUser.userType === "student" 
                    ? "bg-blue-50/50 border border-blue-100" 
                    : "bg-green-50/50 border border-green-100"
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                    selectedUser.userType === "student" ? "text-blue-800" : "text-green-800"
                  }`}>
                    <FaBook className={selectedUser.userType === "student" ? "text-blue-600" : "text-green-600"} /> 
                    {selectedUser.userType === "student" ? "Enrolled Courses" : "Teaching Courses"}
                  </h3>
                  
                  {/* Search Input for Courses */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                        className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <motion.button
                      onClick={() => setCourseSearchTerm('')}
                      className="p-2.5 bg-gray-200 text-gray-600 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTimes />
                    </motion.button>
                  </div>
                  
                  {/* Course List */}
                  <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar mb-4 border border-gray-200 rounded-lg bg-white">
                    {selectedUser.courses?.length > 0 ? (
                      <ul className="divide-y divide-gray-100">
                        {selectedUser.courses
                          ?.filter(course => 
                            course.name?.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                            course.code?.toLowerCase().includes(courseSearchTerm.toLowerCase())
                          )
                          .map(course => (
                            <li key={course.id} className="p-3 hover:bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-800">{course.code}</span>
                                  <span className="text-gray-600"> - {course.name}</span>
                                </div>
                                <motion.button
                                  onClick={() => 
                                    selectedUser.userType === "student" 
                                      ? removestudentfromcourse(course.id, selectedUser.id)
                                      : removefacultyfromcourse(course.id, selectedUser.id)
                                  }
                                  className="text-red-500 hover:text-red-700 p-1.5"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaTrashAlt />
                                </motion.button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No courses found
                      </div>
                    )}
                  </div>
                  
                  {/* Add to Course */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add to Course</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                      <motion.button
                        onClick={() => 
                          selectedUser.userType === "student" 
                            ? addstudenttocourse(selectedCourse, selectedUser.id)
                            : addfacultytocourse(selectedCourse, selectedUser.id)
                        }
                        disabled={!selectedCourse}
                        className={`py-2.5 px-4 rounded-lg flex items-center gap-1 ${
                          !selectedCourse 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        }`}
                        whileHover={selectedCourse ? { scale: 1.03 } : {}}
                        whileTap={selectedCourse ? { scale: 0.97 } : {}}
                      >
                        <FaPlus size={14} />
                        <span>Add</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <motion.button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
                whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className={`px-5 py-2.5 rounded-lg font-medium ${
                  !hasChanges 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                }`}
                whileHover={hasChanges ? { scale: 1.03 } : {}}
                whileTap={hasChanges ? { scale: 0.97 } : {}}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageUsers;