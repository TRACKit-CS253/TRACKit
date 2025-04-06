import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaEdit, FaBook, FaSearch, FaUserGraduate, FaChalkboardTeacher, FaFileUpload, FaRegUser } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const ManageCourses = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [newCourse, setNewCourse] = useState({
    id: "",
    code: "",
    name: "",
    description: "",
    credits: 0,
    semester: "",
    Students: [], 
    Faculty: [],
  });
  const [courseDetails, setCourseDetails] = useState({
    Students: [],
    Faculty: [],
  });
  const [activeTab, setActiveTab] = useState("edit");
  const [testRollNumber, setTestRollNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  // Filtered lists based on search terms
  const filteredStudents = courseDetails.Students.filter((student) =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const filteredFaculty = courseDetails.Faculty.filter((faculty) =>
    faculty.name.toLowerCase().includes(facultySearchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.data);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Edit course handler
  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setNewCourse({ ...course });
    setShowModal(true);
  };

  // Delete course handler
  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );
    if (!confirmDelete) return; // Exit if the user cancels

    try {
      await axiosInstance.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter((course) => course.id !== courseId));
      alert("Course deleted successfully.");
    } catch (error) {
      console.error("Error deleting course: ", error);
      alert("Failed to delete the course.");
    }
  };

  const handlegetuserIdfromRollnumber = async (rollNumber) => {
    try {
      const response = await axiosInstance.get(`/api/student/rollNumber/${rollNumber}`);
      console.log("Response:", response.data);
      if (response.status === 200) {
        return response.data.userId; // Assuming the response contains the user ID
      } else {
        throw new Error("Failed to fetch user ID.");
      }
    } catch (error) {
      console.error("Error fetching user ID from roll number:", error);
      alert("Failed to fetch user ID from roll number.");
      return null; // Return null if there's an error
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      const students =
        response.data.data.students?.map((student) => ({
          id: student.userId,
          name: `${student.user.firstName} ${student.user.lastName} - ${student.rollNumber} (${student.major})`,
        })) || [];

      const faculty =
        response.data.data.faculty?.map((fac) => ({
          id: fac.userId,
          name: `${fac.user.firstName} ${fac.user.lastName} - ${fac.position} (${fac.department})`,
        })) || [];

      setCourseDetails({ Students: students, Faculty: faculty, id: courseId });
      setActiveTab("details"); // Switch to the "details" tab
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const handleViewDetails = async (courseId) => {
    try {
      // Fetch course details using the existing fetchCourseDetails function
      await fetchCourseDetails(courseId);

      // Switch to the "details" tab
      setActiveTab("details");
    } catch (error) {
      console.error("Error viewing course details:", error);
      alert("Failed to load course details.");
    }
  };

  const handleBulkAddStudents = async (file, courseId) => {
    try {
      const Papa = await import("papaparse");
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data;

          for (const row of rows) {
            let userId = row.UserId || null;

            if (!userId && row.rollNumber) {
              userId = await handlegetuserIdfromRollnumber(row.rollNumber);
            }

            if (userId) {
              try {
                await axiosInstance.post("/api/courses/add-student", {
                  courseId,
                  userId,
                });
              } catch (error) {
                console.error(
                  `Error adding student with userId ${userId} to course ${courseId}:`,
                  error
                );
              }
            } else {
              console.error(
                `Skipping row: Missing userId or rollNumber for row:`,
                row
              );
            }
          }

          alert("Bulk students added successfully!");

          await fetchCourseDetails(courseId);
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          alert("Failed to parse the CSV file.");
        },
      });
    } catch (error) {
      console.error("Error adding bulk students:", error);
      alert("Failed to add bulk students.");
    }
  };

  // Save course handler (PUT request)
  const handleSaveCourse = async () => {
    try {
      await axiosInstance.put(`/api/courses/${editCourseId}`, newCourse);
      const updatedCourses = courses.map((course) =>
        course.id === editCourseId ? newCourse : course
      );
      setCourses(updatedCourses);
      handleCancel(); // Close modal and reset form
    } catch (error) {
      console.error("Error updating course: ", error);
    }
  };

  const removefacultyfromcourse = async (courseId, userId) => {

    try {
      const response = await axiosInstance.delete(
        `/api/courses/remove-faculty/${courseId}/${userId}`
      );
      if (response.status === 200) {
        setCourseDetails((prev) => ({
          ...prev,
          Faculty: prev.Faculty.filter((faculty) => faculty.id !== userId),
        }));
      } else {
        throw new Error("Failed to remove faculty.");
      }
    } catch (error) {
      console.error("Error removing faculty from course:", error);
      alert("Failed to remove faculty from course.");
    }
  };

  const removestudentfromcourse = async (courseId, userId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/courses/remove-student/${courseId}/${userId}`
      );
      if (response.status === 200) {
        setCourseDetails((prev) => ({
          ...prev,
          Students: prev.Students.filter((student) => student.id !== userId),
        }));
      } else {
        throw new Error("Failed to remove student.");
      }
    } catch (error) {
      console.error("Error removing student from course:", error);
      alert("Failed to remove student from course.");
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleFacultySelection = (facultyId) => {
    setSelectedFaculty((prev) =>
      prev.includes(facultyId)
        ? prev.filter((id) => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const removeSelectedStudents = async () => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove the selected students from the course?"
    );
    if (!confirmRemove) return;

    try {
      for (const studentId of selectedStudents) {
        await removestudentfromcourse(courseDetails.id, studentId);
      }
      setSelectedStudents([]); // Clear selection after removal
      alert("Selected students removed successfully.");
    } catch (error) {
      console.error("Error removing selected students:", error);
      alert("Failed to remove selected students.");
    }
  };

  const removeSelectedFaculty = async () => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove the selected faculty members from the course?"
    );
    if (!confirmRemove) return;

    try {
      for (const facultyId of selectedFaculty) {
        await removefacultyfromcourse(courseDetails.id, facultyId);
      }
      setSelectedFaculty([]); // Clear selection after removal
      alert("Selected faculty removed successfully.");
    } catch (error) {
      console.error("Error removing selected faculty:", error);
      alert("Failed to remove selected faculty.");
    }
  };

  // Cancel and reset form
  const handleCancel = () => {
    setShowModal(false);
    setNewCourse({
      id: "",
      code: "",
      name: "",
      description: "",
      credits: 0,
      semester: "",
      Students: [],
      Faculty: [],
    });
  };

  // Filter courses by name or code
  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Manage Courses
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
      <div className="pt-24 px-8 max-w-6xl mx-auto">
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
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </motion.div>

        {/* Course List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FaBook className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
                        <div className="flex gap-6 mt-1">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">Code:</span> {course.code}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">Semester:</span> {course.semester}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">Credits:</span> {course.credits}
                          </p>
                        </div>
                      </div>
                    </div>
                    {course.description && (
                      <p className="mt-2 text-gray-600 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => handleEditCourse(course)}
                      className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit size={16} /> Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteCourse(course.id)}
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
              <p className="text-gray-500 text-lg">No courses found matching your search</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Course Modal */}
      {showModal && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-[45rem] max-h-[85vh] flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-t-xl">
              <h2 className="text-xl font-semibold">
                {activeTab === "edit" 
                  ? "Edit Course Details" 
                  : "Course Management"}
              </h2>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b px-6 pt-4 pb-2 gap-4">
              <button
                onClick={() => setActiveTab("edit")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === "edit"
                    ? "bg-blue-100 text-blue-700 font-semibold" 
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaEdit />
                  <span>Course Details</span>
                </div>
              </button>
              <button
                onClick={() => handleViewDetails(newCourse.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === "details"
                    ? "bg-blue-100 text-blue-700 font-semibold"  
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUserGraduate />
                  <span>Users</span>
                </div>
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "edit" ? (
                <div className="space-y-6">
                  {/* Edit Course Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                      <input
                        type="text"
                        value={newCourse.id}
                        readOnly
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                      <input
                        type="text"
                        value={newCourse.code}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, code: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <select
                        value={newCourse.semester}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, semester: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Select Semester</option>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                      <input
                        type="text"
                        value={newCourse.name}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                      <input
                        type="number"
                        value={newCourse.credits}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, credits: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newCourse.description}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, description: e.target.value })
                        }
                        rows="4"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Students Enrolled Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <FaUserGraduate size={18} />
                      <span>Enrolled Students</span>
                    </h3>
                    {/* Search Bar for Students */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search students by name..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                    </div>

                    {filteredStudents.length > 0 ? (
                      <div>
                        <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {filteredStudents.map((student) => (
                              <li
                                key={student.id}
                                className={`p-3 rounded-lg flex justify-between items-center transition-all duration-200 ${
                                  selectedStudents.includes(student.id)
                                    ? "bg-blue-200 border border-blue-300"
                                    : "bg-white border border-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-blue-500"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudentSelection(student.id)}
                                  />
                                  <span>{student.name}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {selectedStudents.length > 0 && (
                          <motion.button
                            onClick={removeSelectedStudents}
                            className="mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <FaTrashAlt size={14} />
                            <span>Remove {selectedStudents.length} Selected</span>
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
                        <p className="text-gray-500">No students enrolled in this course</p>
                      </div>
                    )}
                  </div>

                  {/* Faculty Assigned Section */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 shadow-sm border border-green-200">
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <FaChalkboardTeacher size={18} />
                      <span>Faculty Assigned</span>
                    </h3>
                    {/* Search Bar for Faculty */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search faculty by name..."
                        value={facultySearchTerm}
                        onChange={(e) => setFacultySearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
                    </div>

                    {filteredFaculty.length > 0 ? (
                      <div>
                        <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          <ul className="space-y-2">
                            {filteredFaculty.map((faculty) => (
                              <li
                                key={faculty.id}
                                className={`p-3 rounded-lg flex justify-between items-center transition-all duration-200 ${
                                  selectedFaculty.includes(faculty.id)
                                    ? "bg-green-200 border border-green-300"
                                    : "bg-white border border-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-green-500"
                                    checked={selectedFaculty.includes(faculty.id)}
                                    onChange={() => toggleFacultySelection(faculty.id)}
                                  />
                                  <span>{faculty.name}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {selectedFaculty.length > 0 && (
                          <motion.button
                            onClick={removeSelectedFaculty}
                            className="mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <FaTrashAlt size={14} />
                            <span>Remove {selectedFaculty.length} Selected</span>
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
                        <p className="text-gray-500">No faculty assigned to this course</p>
                      </div>
                    )}
                  </div>

                  {/* Bulk Add Students Section */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 shadow-sm border border-amber-200">
                    <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                      <FaFileUpload size={18} />
                      <span>Bulk Student Upload</span>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload a CSV file with <span className="font-medium">userId</span> or <span className="font-medium">rollNumber</span> to add students to this course.
                    </p>
                    
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        <div className="flex flex-col items-center justify-center">
                          <FaFileUpload className="text-amber-500 mb-2" size={24} />
                          <span className="text-sm text-gray-500">
                            {selectedFile ? selectedFile.name : "Choose CSV file"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <motion.button
                      onClick={() => {
                        if (selectedFile) {
                          handleBulkAddStudents(selectedFile, courseDetails.id);
                        } else {
                          alert("Please select a file first.");
                        }
                      }}
                      className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!selectedFile}
                    >
                      <FaFileUpload size={16} />
                      <span>Upload Student Data</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="p-4 border-t flex justify-end gap-3">
              <motion.button
                onClick={handleCancel}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              
              {activeTab === "edit" && (
                <motion.button
                  onClick={handleSaveCourse}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Save Changes
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageCourses;