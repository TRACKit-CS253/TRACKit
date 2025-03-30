import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import { GoHome } from "react-icons/go";


const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.data);
      } catch (error) {
        console.error("Error fetching courses: ", error);
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
      // console.log("Response:", response.data);
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
      const Papa = await import("papaparse"); // Dynamically import PapaParse
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true, // Skip empty rows
        complete: async (results) => {
          const rows = results.data; // Parsed rows from the CSV file

          for (const row of rows) {
            let userId = row.UserId;

            // If userId is not provided, fetch it using rollNumber
            if (!userId && row.rollNumber) {
              userId = await handlegetuserIdfromRollnumber(row.rollNumber);
            }

            // If userId is available, add the student to the course
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

          // Fetch updated course details
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
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this faculty member from the course?"
    );
    if (!confirmRemove) return; // Exit if the user cancels

    try {
      const response = await axiosInstance.delete(
        `/api/courses/remove-faculty/${courseId}/${userId}`
      );
      if (response.status === 200) {
        setCourseDetails((prev) => ({
          ...prev,
          Faculty: prev.Faculty.filter((faculty) => faculty.id !== userId),
        }));
        alert("Faculty removed successfully.");
      } else {
        throw new Error("Failed to remove faculty.");
      }
    } catch (error) {
      console.error("Error removing faculty from course:", error);
      alert("Failed to remove faculty from course.");
    }
  };

  const removestudentfromcourse = async (courseId, userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this student from the course?"
    );
    if (!confirmRemove) return; // Exit if the user cancels

    try {
      const response = await axiosInstance.delete(
        `/api/courses/remove-student/${courseId}/${userId}`
      );
      if (response.status === 200) {
        setCourseDetails((prev) => ({
          ...prev,
          Students: prev.Students.filter((student) => student.id !== userId),
        }));
        alert("Student removed successfully.");
      } else {
        throw new Error("Failed to remove student.");
      }
    } catch (error) {
      console.error("Error removing student from course:", error);
      alert("Failed to remove student from course.");
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
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-12">
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 bg-white py-7 px-8 shadow-lg z-10 flex justify-between items-center">
        <div className="flex gap-6">
          <span
            className="text-4xl font-semibold cursor-pointer"
            onClick={() => navigate("/Admin")}
          >
            TRACKit
          </span>
          <div className="cursor-pointer hover:scale-95 duration-200 transition-all rounded-full hover:bg-gray-100 p-2">
            <GoHome
              className="text-[1.9rem]"
              onClick={() => {
                navigate("/Admin");
              }}
            ></GoHome>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-700">Manage Courses</h1>
      </div>

      {/* Search Input */}
      <div className="mt-24">
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search courses by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-4 w-2/3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Course List */}
        <div className="rounded-lg">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-4 rounded-lg mb-4 transition-all duration-200 hover:scale-[101%] hover:shadow-lg bg-gray-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-semibold">{course.name}</p>
                  <p className="text-sm text-gray-700">
                    Course ID: {course.id}
                  </p>
                  <p className="text-sm text-gray-700">Code: {course.code}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-95 hover:shadow-xl"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-95 hover:shadow-xl"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Course Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-20 animate-fade-in">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[40rem] max-h-[80vh] overflow-y-auto">
              {/* Modal Tabs */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-6 py-2 rounded-t-lg ${
                    activeTab === "edit" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  Edit Course
                </button>
                <button
                  onClick={() => handleViewDetails(newCourse.id)}
                  className={`px-6 py-2 rounded-t-lg ${
                    activeTab === "details" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  User Management
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "edit" ? (
                <div>
                  {/* Edit Course Form */}
                  <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    ✏️ Edit Course
                  </h2>
                  <div className="space-y-6">
                    {["id", "code", "name", "description", "credits", "semester"].map(
                      (field) => (
                        <div key={field} className="space-y-2">
                          <label
                            htmlFor={field}
                            className="block text-lg font-medium text-gray-700 capitalize"
                          >
                            {field}:
                          </label>
                          {field === "description" ? (
                            <textarea
                              id={field}
                              value={newCourse[field]}
                              onChange={(e) =>
                                setNewCourse({
                                  ...newCourse,
                                  [field]: e.target.value,
                                })
                              }
                              className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows="4"
                              placeholder={`Enter course ${field}`}
                            />
                          ) : (
                            <input
                              id={field}
                              type={field === "credits" ? "number" : "text"}
                              value={newCourse[field]}
                              onChange={(e) =>
                                setNewCourse({
                                  ...newCourse,
                                  [field]: e.target.value,
                                })
                              }
                              className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Enter course ${field}`}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* View Details Content */}
                  <h2 className="text-3xl font-semibold text-center mb-5 text-gray-800">
                    📖 Course Details
                  </h2>
                  <div className="mb-6 p-4 rounded-lg shadow-md bg-blue-50">
                    <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                      👨‍🎓 Students Enrolled
                    </h3>
                    {courseDetails.Students.length > 0 ? (
                      <ul className="list-none mt-3 space-y-2">
                        {courseDetails.Students.map((student) => (
                          <li
                            key={student.id}
                            className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
                          >
                            <span className="text-gray-700">{student.name}</span>
                            <button
                              onClick={() =>
                                console.log("Remove student:", student.id) ||
                                removestudentfromcourse(courseDetails.id, student.id)
                              }
                              className="text-red-500 hover:text-red-700 transition-all"
                            >
                              ❌
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 mt-3">No students enrolled.</p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg shadow-md bg-green-50">
                    <h3 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                      🎓 Faculty Assigned
                    </h3>
                    {courseDetails.Faculty.length > 0 ? (
                      <ul className="list-none mt-3 space-y-2">
                        {/* Faculty List */}
                        {courseDetails.Faculty.map((faculty) => (
                          <li
                            key={faculty.id}
                            className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
                          >
                            <span className="text-gray-700">{faculty.name}</span>
                            <button
                              onClick={() =>
                                removefacultyfromcourse(courseDetails.id, faculty.id)
                              }
                              className="text-red-500 hover:text-red-700 transition-all"
                            >
                              ❌
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 mt-3">No faculty assigned.</p>
                    )}
                  </div>
                  {/* Bulk Add Students Section */}
                  <div className="mt-6 p-4 rounded-lg shadow-md bg-yellow-50">
                    <h3 className="text-xl font-semibold text-yellow-600 flex items-center gap-2">
                      📂 Add Students in Bulk
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Upload a CSV file with <strong>userId</strong> or <strong>rollNumber</strong> to add students to this course.
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setSelectedFile(e.target.files[0])} // Save the selected file
                      className="mt-4 p-3 w-full border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (selectedFile) {
                          handleBulkAddStudents(selectedFile, courseDetails.id); // Process the file on button click
                        } else {
                          alert("Please select a file first.");
                        }
                      }}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Close
                </button>
                {activeTab === "edit" && (
                  <button
                    onClick={handleSaveCourse}
                    className="bg-blue-500 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;
