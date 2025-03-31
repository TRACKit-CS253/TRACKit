import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDropdown } from "react-icons/io";
import { FaRegEdit, FaDownload, FaFilePdf } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { NavLink } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';



export default function Lectures({ role }) {
  const { courseDetails, loading } = useCourse(); // Ensure loading state is used
  const { showNotification } = useNotification();

  const [lectures, setLectures] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create');
  const [formData, setFormData] = useState({
    heading: '', // Updated from week
    subheading: '', // Updated from topicTitle
    lectureTitle: '',
    lectureDescription: '',
    pdfUrl: '',
    youtubeLink: '' // Add YouTube link field
  });
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]); // Updated state for multiple PDF files
  const [showHeadingForm, setShowHeadingForm] = useState(false);
  const [showSubheadingForm, setShowSubheadingForm] = useState({});
  const [newHeadingData, setNewHeadingData] = useState({ // Replace newHeading with newHeadingData object
    heading: '',
    subheading: ''
  });
  const [subheadingFormData, setSubheadingFormData] = useState({
    heading: '',
    subheading: '',
  });
  const [showSubsectionForm, setShowSubsectionForm] = useState(false); // New state for subsection modal
  const [subsectionFormData, setSubsectionFormData] = useState({
    heading: '',
    subheading: '',
  }); // New state for subsection form data
  const [showSubheadingDeleteConfirm, setShowSubheadingDeleteConfirm] = useState(false);
  const [subheadingToDelete, setSubheadingToDelete] = useState(null);

  useEffect(() => {
    if (courseDetails?.id) {
      fetchLectures();
    }
  }, [courseDetails]); // Removed 'fetchLectures' from dependency array

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/lectures/course/${courseDetails.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const grouped = response.data.data.reduce((acc, heading) => {
          acc[heading.heading] = heading.subheadings.reduce((subAcc, subheading) => {
            subAcc[subheading.subheading] = subheading.lectures;
            return subAcc;
          }, {});
          return acc;
        }, {});

        setLectures(grouped);
      } else {
        showNotification('Failed to fetch lectures', 'error');
      }
    } catch (err) {
      console.error('Error fetching lectures:', err);
      showNotification('Error loading lectures', 'error');
    }
  };

  const toggleWeek = (week) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  const handleEditClick = (e, lecture) => {
    e.stopPropagation();
    
    // We need to find which heading and subheading this lecture belongs to
    let foundHeading = '';
    let foundSubheading = '';
    
    // Loop through lectures structure to find the heading and subheading
    Object.entries(lectures).forEach(([heading, topics]) => {
      Object.entries(topics).forEach(([subheading, lectureList]) => {
        lectureList.forEach(item => {
          if (item.id === lecture.id) {
            foundHeading = heading;
            foundSubheading = subheading;
          }
        });
      });
    });
    
    setFormType('edit');
    setFormData({
      heading: foundHeading, // Use the found heading
      subheading: foundSubheading, // Use the found subheading
      lectureTitle: lecture.lectureTitle,
      lectureDescription: lecture.lectureDescription,
      pdfUrl: lecture.pdfUrl,
      youtubeLink: lecture.youtubeLink
    });
    setCurrentLectureId(lecture.id);
    setShowForm(true);
  };

  const handleDeleteClick = (e, lecture) => {
    e.stopPropagation();
    setLectureToDelete(lecture);
    setShowDeleteConfirm(true);
  };

  const downloadHandler = (e, fileUrls) => {
    e.stopPropagation();
    console.log('Download handler called with fileUrls:', fileUrls); // Add debug log
    if (!fileUrls || fileUrls.length === 0) {
      console.error('No files available');
      showNotification('No files available for download', 'error');
      return;
    }
  
    const fileList = fileUrls.map((file, index) => ({
      name: file.name || `File ${index + 1}`,
      url: file.url,
      type: file.type,
    }));
  
    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '80px'; // Changed from '0' to '80px' to bring it down from top
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.zIndex = '1000';
    overlay.style.transform = 'translateY(-100%)';
    overlay.style.transition = 'transform 0.3s ease-in-out';
    
    // Create the content box
    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = '#ffffff';
    contentBox.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    contentBox.style.borderBottomLeftRadius = '8px';
    contentBox.style.borderBottomRightRadius = '8px';
    contentBox.style.padding = '20px';
    contentBox.style.maxWidth = '800px';
    contentBox.style.margin = '0 auto';
    contentBox.style.position = 'relative';
    
    // Create header with title and close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    
    const title = document.createElement('h3');
    title.textContent = 'Lecture Supplements';
    title.style.margin = '0';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.color = '#111827';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#4B5563';
    closeButton.style.padding = '0 5px';
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create file links list
    const linksList = document.createElement('div');
    linksList.style.display = 'flex';
    linksList.style.flexWrap = 'wrap';
    linksList.style.gap = '10px';
    
    fileList.forEach((file) => {
      const linkContainer = document.createElement('div');
      linkContainer.style.padding = '8px 12px';
      linkContainer.style.backgroundColor = '#F3F4F6';
      linkContainer.style.borderRadius = '6px';
      linkContainer.style.display = 'flex';
      linkContainer.style.alignItems = 'center';
      linkContainer.style.gap = '8px';
  
      const fileIcon = document.createElement('span');
      fileIcon.innerHTML = file.type.includes('pdf')
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #EF4444;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' // PDF iconon
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4B5563;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'; // Generic file iconon
  
      const link = document.createElement('a');
      link.href = file.url;
      link.textContent = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.color = '#1D4ED8';
      link.style.textDecoration = 'none';
      link.style.fontWeight = '500';
  
      linkContainer.appendChild(fileIcon);
      linkContainer.appendChild(link);
      linksList.appendChild(linkContainer);
    });
    
    // Assemble everything
    contentBox.appendChild(header);
    contentBox.appendChild(linksList);
    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);
    
    // Force reflow for animation
    void overlay.offsetHeight; // Use void operator to avoid unused expression error
    
    // Show the overlay with animation
    overlay.style.transform = 'translateY(0)';
    
    // Close handlers
    const closeOverlay = () => {
      overlay.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300); // Match the transition duration
    };
    
    closeButton.addEventListener('click', closeOverlay);
    
    // Close when clicking outside the content box (optional)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      formDataToSend.append('courseId', courseDetails.id);
      formDataToSend.append('heading', formData.heading);
      formDataToSend.append('subheading', formData.subheading);
      formDataToSend.append('lectureTitle', formData.lectureTitle);
      formDataToSend.append('lectureDescription', formData.lectureDescription);
      formDataToSend.append('youtubeLink', formData.youtubeLink || '');

      pdfFiles.forEach((file) => formDataToSend.append('files', file)); // Updated to handle all file types

      const url = formType === 'create'
        ? `${process.env.REACT_APP_API_URL}/api/lectures`
        : `${process.env.REACT_APP_API_URL}/api/lectures/${courseDetails.id}/${currentLectureId}`;

      const response = await axios({
        method: formType === 'create' ? 'post' : 'put',
        url,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showNotification(`Lecture ${formType === 'create' ? 'created' : 'updated'} successfully`, 'success');
        fetchLectures();
      } else {
        showNotification(response.data.message || 'Failed to submit lecture', 'error');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      showNotification(`Error submitting lecture: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
      setShowForm(false);
      setFormData({ heading: '', subheading: '', lectureTitle: '', lectureDescription: '', pdfUrl: '', youtubeLink: '' });
      setPdfFiles([]);
      setCurrentLectureId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!lectureToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL}/api/lectures/${courseDetails.id}/${lectureToDelete.id}/`;

      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        showNotification('Lecture deleted successfully', 'success');
        setShowDeleteConfirm(false);
        fetchLectures(); // Refresh the lectures list
      } else {
        showNotification(response.data.message || 'Failed to delete lecture', 'error');
      }
    } catch (err) {
      console.error('Error deleting lecture:', err);
      showNotification('Error deleting lecture', 'error');
    }
  };

  const handleAddHeading = async () => {
    if (!newHeadingData.heading.trim()) {
      showNotification('Module name is required', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sending heading data:', {
        courseId: courseDetails.id,
        heading: newHeadingData.heading,
      });
      
      // Create heading without requiring subheading
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lectures/heading`,
        { 
          courseId: courseDetails.id, 
          heading: newHeadingData.heading,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Module added successfully', 'success');
        fetchLectures(); // Refresh the lectures list
      } else {
        showNotification(response.data.message || 'Failed to add module', 'error');
      }
    } catch (err) {
      console.error('Error adding heading:', err);
      showNotification(`Error adding module: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setShowHeadingForm(false);
      setNewHeadingData({ heading: '', subheading: '' });
    }
  };

  const handleAddLecture = (heading, subheading) => {
    setFormType('create');
    setFormData({
      heading, // Pass the heading directly
      subheading, // Pass the subheading directly
      lectureTitle: '',
      lectureDescription: '',
      pdfUrl: '',
      youtubeLink: '' // Add YouTube link field
    });
    setShowForm(true);
  };

  const handleAddSubsectionClick = (heading) => {
    setSubsectionFormData({ heading, subheading: '' }); // Initialize form data with the heading
    setShowSubsectionForm(true); // Open the modal
  };

  const handleSubsectionFormSubmit = async (e) => {
    e.preventDefault();
    if (!subsectionFormData.subheading.trim()) {
      showNotification('Subsection cannot be empty', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lectures/subheading`,
        {
          courseId: courseDetails.id,
          heading: subsectionFormData.heading,
          subheading: subsectionFormData.subheading,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Subsection added successfully', 'success');
        fetchLectures(); // Refresh the lectures list
      } else {
        showNotification(response.data.message || 'Failed to add subsection', 'error');
      }
    } catch (err) {
      console.error('Error adding subsection:', err);
      showNotification('Error adding subsection', 'error');
    } finally {
      setShowSubsectionForm(false); // Close the modal
      setSubsectionFormData({ heading: '', subheading: '' }); // Reset form data
    }
  };

  const handleEditSubheadingClick = (heading, subheading) => {
    // Store both the heading and subheading information
    setSubheadingFormData({ 
      heading: heading, // Store the heading (module name)
      subheading: subheading,
      currentSubheading: subheading // Store the original subheading value
    });
    setShowSubheadingForm((prev) => ({ ...prev, [`${heading}-${subheading}`]: true }));
  };

  const handleEditSubheadingSubmit = async (e, heading) => {
    e.preventDefault();
    if (!subheadingFormData.subheading.trim()) {
      showNotification('Subheading cannot be empty', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/lectures/${courseDetails.id}/subheading`,
        {
          heading: subheadingFormData.heading, // Include the heading (module name)
          currentSubheading: subheadingFormData.currentSubheading || subheadingFormData.subheading, // Use stored original subheading
          newSubheading: subheadingFormData.subheading  // New subheading value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Subheading updated successfully', 'success');
        fetchLectures(); // Refresh the lectures list
      } else {
        showNotification(response.data.message || 'Failed to update subheading', 'error');
      }
    } catch (err) {
      console.error('Error updating subheading:', err);
      showNotification('Error updating subheading', 'error');
    } finally {
      // Use the same key format when closing the form
      setShowSubheadingForm((prev) => ({ ...prev, [`${heading}-${subheadingFormData.currentSubheading || subheadingFormData.subheading}`]: false }));
      setSubheadingFormData({ heading: '', subheading: '', currentSubheading: '' });
    }
  };

  const handleDeleteSubheadingClick = (e, heading, subheading) => {
    e.stopPropagation();
    setSubheadingToDelete({ heading, subheading });
    setShowSubheadingDeleteConfirm(true);
  };

  const handleDeleteSubheadingConfirm = async () => {
    if (!subheadingToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/lectures/${courseDetails.id}/subheading`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            heading: subheadingToDelete.heading,
            subheading: subheadingToDelete.subheading
          }
        }
      );

      if (response.data.success) {
        showNotification('Section deleted successfully', 'success');
        fetchLectures(); // Refresh the lectures list
      } else {
        showNotification(response.data.message || 'Failed to delete section', 'error');
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      showNotification('Error deleting section', 'error');
    } finally {
      setShowSubheadingDeleteConfirm(false);
      setSubheadingToDelete(null);
    }
  };

  // Show loading indicator while fetching course details
  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="animate-pulse text-xl">Loading course details...</div>
      </div>
    );
  }

  // Handle case where courseDetails is null or undefined
  if (!courseDetails) {
    return (
      <div className='w-full p-4'>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Course details not available. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-500 underline"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  // Safely access courseDetails properties
  return (
    <div className='w-full h-screen overflow-y-auto'>
      {/* Header */}
      <div className='flex justify-between py-2 px-8 items-center sticky top-0 bg-[#F5F5F5] shadow-md z-50'>
        <div>
          <p className='text-[32px] uppercase font-semibold m-4'>Lectures</p>
          <p className='text-gray-600 ml-4 -mt-3'>
            {courseDetails.code} • {courseDetails.credits} Credits • {courseDetails.semester}
          </p>
        </div>
        <NavLink to="/dashboard/profile">
          <CgProfile className='text-[40px] cursor-pointer hover:text-blue-500 duration-200 transition-all' />
        </NavLink>
      </div>

      {/* Add Section Button */}
      {role !== "student" && (
        <div className='flex justify-start py-2 px-8'> {/* Reduced padding from py-4 to py-2 */}
          <button
            className='bg-black text-white py-2 px-4 flex justify-center items-center gap-2 hover:bg-gray-800 transition-all duration-200 rounded-full'
            onClick={() => setShowHeadingForm(true)}
          >
            <p>Add Module</p>
          </button>
        </div>
      )}

      {/* Lecture Content */}
      <div className='p-4 md:p-6'>
        {Object.keys(lectures).length > 0 ? (
          Object.entries(lectures).map(([heading, topics]) => (
            <div key={heading} className='mb-3'>
              {/* Heading Header */}
              <div
                className='w-full md:w-[98%] py-3 mx-auto md:ml-6 border-2 flex flex-col px-4 md:px-8 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 relative'
                onClick={() => toggleWeek(heading)}
              >
                <div className='flex justify-between w-full font-semibold items-center flex-wrap gap-2'>
            <span className='text-lg break-words max-w-[70%]'>{heading}</span>
            <div className='flex items-center gap-2 flex-wrap'>
              {role !== "student" && (
                <button
                  className='bg-black text-white py-1 px-2 rounded-full hover:bg-gray-800 transition-all duration-200 text-sm whitespace-nowrap'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSubsectionClick(heading);
                  }}
                >
                  Add Section
                </button>
              )}
              <IoIosArrowDropdown
                className={`text-[25px] transform transition-transform duration-500 ${
                  expandedWeeks[heading] ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

                {/* Expanded content - better responsive layout */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expandedWeeks[heading] ? 'max-h-[1000px] opacity-100 py-3' : 'max-h-0 opacity-0'
            }`}
          >
            {Object.entries(topics).map(([subheading, lectures]) => (
              <div key={subheading} className="mb-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-lg mb-2 break-words">{subheading}</h3>
                    {role !== "student" && (
                      <div className="flex items-center gap-1">
                        <button
                          className='bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-all duration-200'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubheadingClick(heading, subheading);
                          }}
                        >
                          <FaRegEdit className='text-[14px]' />
                        </button>
                        <button
                          className='bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-all duration-200'
                          onClick={(e) => handleDeleteSubheadingClick(e, heading, subheading)}
                        >
                          <AiOutlineDelete className='text-[14px] text-red-600' />
                        </button>
                      </div>
                    )}
                  </div>
                  {role !== "student" && (
                    <button
                      className='bg-black text-white py-1 px-2 rounded-full hover:bg-gray-800 transition-all duration-200 text-sm whitespace-nowrap'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddLecture(heading, subheading);
                      }}
                    >
                      Add Lecture
                    </button>
                  )}
                </div>

                {/* Individual lectures with better responsiveness */}
                {lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="ml-2 md:ml-4 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg hover:bg-gray-50 gap-2"
                  >
                    <a
                      href={lecture.youtubeLink || '#'}
                      target={lecture.youtubeLink ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className={`text-blue-600 hover:underline break-words ${!lecture.youtubeLink && 'cursor-not-allowed'}`}
                      onClick={(e) => {
                        if (!lecture.youtubeLink || lecture.youtubeLink === "null") {
                          e.preventDefault();
                          showNotification('No video lecture uploaded', 'error');
                        }
                      }}
                    >
                      {lecture.lectureTitle}
                    </a>

                    <div className='flex gap-4 items-center'>
                      <button
                        onClick={(e) => downloadHandler(e, lecture.fileUrls)}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:underline"
                      >
                        <FaFilePdf className="text-red-500" />
                        <FaDownload className="text-[14px]" />
                      </button>

                      {role !== "student" && (
                        <div className='flex gap-2 items-center'>
                          <button onClick={(e) => handleEditClick(e, lecture)}>
                            <FaRegEdit className='text-[18px]' />
                          </button>
                          <button onClick={(e) => handleDeleteClick(e, lecture)}>
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
    ))
  ) : (
    <div className='text-center text-gray-600 p-10 bg-gray-50 rounded-lg shadow-sm'>
      No lectures available. {role !== "student" && "Use the Add Module button to get started."}
    </div>
  )}
</div>

      {/* Heading Form Modal */}
      {showHeadingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Module</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Module Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Module Name"
                  value={newHeadingData.heading}
                  onChange={(e) => setNewHeadingData({...newHeadingData, heading: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Removed subheading input field */}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowHeadingForm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddHeading}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {formType === 'create' ? 'Add Lecture' : 'Edit Lecture'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                {formType === 'edit' && (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Module</label>
                      <input
                        type="text"
                        value={formData.heading}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Section</label>
                      <input
                        type="text"
                        value={formData.subheading}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                      />
                    </div>
                  </>
                )}
                <input
                  type="text"
                  placeholder="Lecture Title"
                  value={formData.lectureTitle}
                  onChange={(e) => setFormData({ ...formData, lectureTitle: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Lecture Description"
                  value={formData.lectureDescription}
                  onChange={(e) => setFormData({ ...formData, lectureDescription: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
                
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setPdfFiles(Array.from(e.target.files))} // Updated to handle all file types
                    className="w-full p-2 border rounded"
                    id="fileInput"
                    style={{ display: 'block' }}
                  />
                  {pdfFiles.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                      <ul className="max-h-24 overflow-y-auto">
                        {pdfFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                            <span className="text-gray-500">{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <input
                  type="url"
                  placeholder="YouTube Link"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form> {/* Properly closed the <form> tag */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this lecture?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subsection Form Modal */}
      {showSubsectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Section</h2>
            <form onSubmit={handleSubsectionFormSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={subsectionFormData.heading}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
                <input
                  type="text"
                  placeholder="Section Title"
                  value={subsectionFormData.subheading}
                  onChange={(e) =>
                    setSubsectionFormData({ ...subsectionFormData, subheading: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowSubsectionForm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add the Edit Subheading Modal */}
      {Object.entries(showSubheadingForm).some(([key, value]) => value === true) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Section</h2>
            <form onSubmit={(e) => handleEditSubheadingSubmit(e, subheadingFormData.heading)}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Module Name</label>
                  <input
                    type="text"
                    value={subheadingFormData.heading}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Section Name</label>
                  <input
                    type="text"
                    placeholder="Edit Section Name"
                    value={subheadingFormData.subheading}
                    onChange={(e) => setSubheadingFormData({ ...subheadingFormData, subheading: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  onClick={() => {
                    // Close all subheading forms
                    const updatedForms = {};
                    Object.keys(showSubheadingForm).forEach(key => {
                      updatedForms[key] = false;
                    });
                    setShowSubheadingForm(updatedForms);
                    setSubheadingFormData({ heading: '', subheading: '', currentSubheading: '' });
                  }}
                > 
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subheading Delete Confirmation Modal */}
      {showSubheadingDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Section Deletion</h2>
            <p>Are you sure you want to delete the section "{subheadingToDelete?.subheading}"?</p>
            <p className="text-red-600 mt-2">
              Warning: This will delete all lectures in this section.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowSubheadingDeleteConfirm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubheadingConfirm}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}