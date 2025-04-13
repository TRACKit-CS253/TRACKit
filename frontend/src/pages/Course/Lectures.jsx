import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDropdown } from "react-icons/io";
import { FaRegEdit, FaDownload, FaFilePdf, FaPlus, FaAngleDown, FaEdit, FaTrashAlt, FaYoutube, FaFile } from "react-icons/fa";
import { AiOutlineDelete, AiOutlineYoutube } from "react-icons/ai";
import { IoBook, IoBookmark, IoSchool } from "react-icons/io5";
import { NavLink } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

export default function Lectures({ role }) {
  const { courseDetails, loading } = useCourse();
  const { showNotification } = useNotification();

  const [lectures, setLectures] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create');
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    lectureTitle: '',
    lectureDescription: '',
    pdfUrl: '',
    youtubeLink: ''
  });
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [showHeadingForm, setShowHeadingForm] = useState(false);
  const [showSubheadingForm, setShowSubheadingForm] = useState({});
  const [newHeadingData, setNewHeadingData] = useState({
    heading: '',
    subheading: ''
  });
  const [subheadingFormData, setSubheadingFormData] = useState({
    heading: '',
    subheading: '',
  });
  const [showSubsectionForm, setShowSubsectionForm] = useState(false);
  const [subsectionFormData, setSubsectionFormData] = useState({
    heading: '',
    subheading: '',
  });
  const [showSubheadingDeleteConfirm, setShowSubheadingDeleteConfirm] = useState(false);
  const [subheadingToDelete, setSubheadingToDelete] = useState(null);

  useEffect(() => {
    if (courseDetails?.id) {
      fetchLectures();
    }
  }, [courseDetails]);

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
    
    let foundHeading = '';
    let foundSubheading = '';
    
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
      heading: foundHeading,
      subheading: foundSubheading,
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
    
    // Check if there's already an open overlay
    const existingOverlay = document.getElementById('file-download-overlay');
    if (existingOverlay) {
      return; // Exit early if an overlay is already open
    }
    
    if (!fileUrls || fileUrls.length === 0) {
      showNotification('No files available for download', 'error');
      return;
    }
  
    const fileList = fileUrls.map((file, index) => ({
      name: file.name || `File ${index + 1}`,
      url: file.url,
      type: file.type,
    }));
  
    const overlay = document.createElement('div');
    overlay.id = 'file-download-overlay'; // Add ID to identify this overlay
    overlay.style.position = 'fixed';
    overlay.style.top = '80px';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.zIndex = '1000';
    overlay.style.transform = 'translateY(-100%)';
    overlay.style.transition = 'transform 0.3s ease-in-out';
    
    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    contentBox.style.backdropFilter = 'blur(12px)';
    contentBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    contentBox.style.borderBottomLeftRadius = '16px';
    contentBox.style.borderBottomRightRadius = '16px';
    contentBox.style.padding = '24px';
    contentBox.style.maxWidth = '800px';
    contentBox.style.margin = '0 auto';
    contentBox.style.position = 'relative';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    
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
    closeButton.style.fontSize = '28px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#4B5563';
    closeButton.style.padding = '0 8px';
    closeButton.style.lineHeight = '1';
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const linksList = document.createElement('div');
    linksList.style.display = 'flex';
    linksList.style.flexWrap = 'wrap';
    linksList.style.gap = '12px';
    
    fileList.forEach((file) => {
      const linkContainer = document.createElement('div');
      linkContainer.style.padding = '12px 16px';
      linkContainer.style.backgroundColor = 'rgba(249, 250, 251, 0.8)';
      linkContainer.style.backdropFilter = 'blur(8px)';
      linkContainer.style.borderRadius = '12px';
      linkContainer.style.display = 'flex';
      linkContainer.style.alignItems = 'center';
      linkContainer.style.gap = '10px';
      linkContainer.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
      linkContainer.style.border = '1px solid rgba(229, 231, 235, 0.7)';
      linkContainer.style.transition = 'transform 0.2s, box-shadow 0.2s';
      linkContainer.style.cursor = 'pointer';
      
      linkContainer.onmouseover = () => {
        linkContainer.style.transform = 'translateY(-2px)';
        linkContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      };
      
      linkContainer.onmouseout = () => {
        linkContainer.style.transform = 'translateY(0)';
        linkContainer.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
      };
  
      const fileIcon = document.createElement('span');
      fileIcon.innerHTML = file.type.includes('pdf')
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #EF4444;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4B5563;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
  
      const link = document.createElement('a');
      link.href = file.url;
      link.textContent = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.color = '#1D4ED8';
      link.style.textDecoration = 'none';
      link.style.fontWeight = '500';
      link.style.fontSize = '14px';
  
      linkContainer.appendChild(fileIcon);
      linkContainer.appendChild(link);
      linksList.appendChild(linkContainer);
    });
    
    contentBox.appendChild(header);
    contentBox.appendChild(linksList);
    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);
    
    // Force browser to acknowledge the new element before animating
    void overlay.offsetHeight;
    
    overlay.style.transform = 'translateY(0)';
    
    const closeOverlay = () => {
      overlay.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300);
    };
    
    closeButton.addEventListener('click', closeOverlay);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  
    // Add escape key handler to close the overlay
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        closeOverlay();
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
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

      pdfFiles.forEach((file) => formDataToSend.append('files', file));

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
        fetchLectures();
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
        fetchLectures();
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
      heading,
      subheading,
      lectureTitle: '',
      lectureDescription: '',
      pdfUrl: '',
      youtubeLink: ''
    });
    setShowForm(true);
  };

  const handleAddSubsectionClick = (heading) => {
    setSubsectionFormData({ heading, subheading: '' });
    setShowSubsectionForm(true);
  };

  const handleSubsectionFormSubmit = async (e) => {
    e.preventDefault();
    if (!subsectionFormData.subheading.trim()) {
      showNotification('Section name cannot be empty', 'error');
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
        showNotification('Section added successfully', 'success');
        fetchLectures();
      } else {
        showNotification(response.data.message || 'Failed to add section', 'error');
      }
    } catch (err) {
      console.error('Error adding section:', err);
      showNotification('Error adding section', 'error');
    } finally {
      setShowSubsectionForm(false);
      setSubsectionFormData({ heading: '', subheading: '' });
    }
  };

  const handleEditSubheadingClick = (heading, subheading) => {
    setSubheadingFormData({ 
      heading: heading,
      subheading: subheading,
      currentSubheading: subheading
    });
    setShowSubheadingForm((prev) => ({ ...prev, [`${heading}-${subheading}`]: true }));
  };

  const handleEditSubheadingSubmit = async (e, heading) => {
    e.preventDefault();
    if (!subheadingFormData.subheading.trim()) {
      showNotification('Section name cannot be empty', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/lectures/${courseDetails.id}/subheading`,
        {
          heading: subheadingFormData.heading,
          currentSubheading: subheadingFormData.currentSubheading || subheadingFormData.subheading,
          newSubheading: subheadingFormData.subheading
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Section updated successfully', 'success');
        fetchLectures();
      } else {
        showNotification(response.data.message || 'Failed to update section', 'error');
      }
    } catch (err) {
      console.error('Error updating section:', err);
      showNotification('Error updating section', 'error');
    } finally {
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
        fetchLectures();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-xl font-medium text-gray-700">Loading course materials...</p>
        </div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-70 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <IoBook className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">Course Not Found</h3>
                <p className="text-yellow-600 mb-4">The course details could not be loaded at this time.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                  >
                    Reload Page
                  </button>
                  <NavLink to="/dashboard/courses" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Back to Courses
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Modern Glassmorphic Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white bg-opacity-70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <IoBook className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Course Materials</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails.code}</span>
                  <span className="text-gray-500 text-sm">{courseDetails.credits} Credits • {courseDetails.semester}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {role !== "student" && (
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setShowHeadingForm(true)}
                >
                  <FaPlus className="text-sm" />
                  <span>Add Module</span>
                </button>
              )}
              
              <NavLink 
                to="/dashboard/profile"
                className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                title="View Profile"
              >
                <CgProfile className="text-2xl text-gray-700" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lecture Content */}
        {Object.keys(lectures).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(lectures).map(([heading, topics]) => (
              <div key={heading} className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
                {/* Module Header */}
                <div
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-b border-gray-100"
                  onClick={() => toggleWeek(heading)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <IoBookmark className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-xl text-gray-800">{heading}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {role !== "student" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSubsectionClick(heading);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all text-sm shadow-sm"
                      >
                        <FaPlus className="text-xs" />
                        <span>Add Section</span>
                      </button>
                    )}
                    <div className={`p-1.5 rounded-full bg-gray-100 transform transition-transform duration-300 ${expandedWeeks[heading] ? 'rotate-180' : ''}`}>
                      <FaAngleDown className="text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Module Content */}
                <div className={`transition-all duration-500 overflow-hidden bg-gray-50 bg-opacity-60 ${
                  expandedWeeks[heading] ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6 space-y-6">
                    {Object.entries(topics).map(([subheading, lectures]) => (
                      <div key={subheading} className="bg-white bg-opacity-90 rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2 bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800">{subheading}</h4>
                            
                            {role !== "student" && (
                              <div className="flex items-center gap-1">
                                <button
                                  className="p-1.5 hover:bg-blue-50 rounded-full transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubheadingClick(heading, subheading);
                                  }}
                                  title="Edit Section"
                                >
                                  <FaEdit className="text-blue-500 text-sm" />
                                </button>
                                <button
                                  className="p-1.5 hover:bg-red-50 rounded-full transition-all"
                                  onClick={(e) => handleDeleteSubheadingClick(e, heading, subheading)}
                                  title="Delete Section"
                                >
                                  <FaTrashAlt className="text-red-500 text-sm" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {role !== "student" && (
                            <button
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm transition-all shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddLecture(heading, subheading);
                              }}
                            >
                              <FaPlus className="text-xs" />
                              <span>Add Lecture</span>
                            </button>
                          )}
                        </div>

                        {/* Lectures */}
                        <div className="divide-y divide-gray-100">
                          {lectures.length > 0 ? (
                            lectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="p-5 hover:bg-gray-50 transition-all"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-lg ${lecture.youtubeLink ? 'bg-red-50' : 'bg-blue-50'} mt-0.5 flex-shrink-0`}>
                                      {lecture.youtubeLink ? (
                                        <FaYoutube className="text-red-500 text-lg" />
                                      ) : (
                                        <FaFile className="text-blue-500 text-lg" />
                                      )}
                                    </div>
                                    <div>
                                      <a
                                        href={lecture.youtubeLink || '#'}
                                        target={lecture.youtubeLink ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className={`text-gray-800 font-medium hover:text-purple-600 break-words ${!lecture.youtubeLink && 'cursor-default hover:text-gray-800'}`}
                                        onClick={(e) => {
                                          if (!lecture.youtubeLink) {
                                            e.preventDefault();
                                          }
                                        }}
                                      >
                                        {lecture.lectureTitle}
                                      </a>
                                      {lecture.lectureDescription && (
                                        <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">
                                          {lecture.lectureDescription}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-3 items-center flex-shrink-0">
                                    {lecture.fileUrls && lecture.fileUrls.length > 0 ? (
                                      <button
                                        onClick={(e) => downloadHandler(e, lecture.fileUrls)}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg text-sm transition-all border border-blue-100 shadow-sm"
                                      >
                                        <FaFilePdf className="text-red-500" />
                                        <span>View Files</span>
                                      </button>
                                    ) : (
                                      <span className="text-sm text-gray-400 italic mr-2">No files</span>
                                    )}

                                    {role !== "student" && (
                                      <div className='flex gap-2 items-center'>
                                        <button 
                                          onClick={(e) => handleEditClick(e, lecture)}
                                          className="p-2 hover:bg-blue-50 rounded-full transition-all"
                                          title="Edit Lecture"
                                        >
                                          <FaEdit className="text-blue-500" />
                                        </button>
                                        <button 
                                          onClick={(e) => handleDeleteClick(e, lecture)}
                                          className="p-2 hover:bg-red-50 rounded-full transition-all"
                                          title="Delete Lecture"
                                        >
                                          <FaTrashAlt className="text-red-500" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              <IoSchool className="mx-auto text-gray-300 text-3xl mb-2" />
                              <p>No lectures in this section yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoBook className="text-blue-500 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">No Content Available Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {role === "student" 
                ? "Your instructor hasn't added any lecture materials yet. Check back later." 
                : "Start adding modules and lectures to provide content for your students."}
            </p>
            {role !== "student" && (
              <button
                onClick={() => setShowHeadingForm(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all inline-flex items-center gap-2 shadow-md"
              >
                <FaPlus />
                Add Your First Module
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Backgrounds with Blur Effect */}
      {(showHeadingForm || showForm || showDeleteConfirm || showSubsectionForm || 
        Object.values(showSubheadingForm).some(value => value) || 
        showSubheadingDeleteConfirm) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300"></div>
      )}

      {/* Heading Form Modal */}
      {showHeadingForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-lg max-w-md w-full p-6 animate-modal-in border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-2.5 rounded-full">
                <IoBook className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add New Module</h2>
                <p className="text-gray-500 text-sm mt-1">Create a new module to organize your course content</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Module Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter module name"
                  value={newHeadingData.heading}
                  onChange={(e) => setNewHeadingData({...newHeadingData, heading: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white bg-opacity-90"
                  required
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowHeadingForm(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddHeading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-xl max-w-3xl w-full p-6 animate-modal-in overflow-y-auto max-h-[90vh] border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-2.5 rounded-full">
                {formType === 'create' ? (
                  <FaPlus className="text-blue-600 text-lg" />
                ) : (
                  <FaEdit className="text-blue-600 text-lg" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {formType === 'create' ? 'Add Lecture Material' : 'Edit Lecture Material'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {formType === 'create' ? 'Create new lecture content for your students' : 'Modify existing lecture content'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {formType === 'edit' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Module</label>
                    <input
                      type="text"
                      value={formData.heading}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Section</label>
                    <input
                      type="text"
                      value={formData.subheading}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Lecture Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter lecture title"
                  value={formData.lectureTitle}
                  onChange={(e) => setFormData({ ...formData, lectureTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Enter lecture description"
                  value={formData.lectureDescription}
                  onChange={(e) => setFormData({ ...formData, lectureDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">YouTube Link (Optional)</label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 py-3 bg-red-50 border border-r-0 border-gray-200 rounded-l-lg">
                    <AiOutlineYoutube className="text-red-600 text-xl" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.youtubeLink}
                    onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload Supplementary Files
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 bg-opacity-70 hover:bg-opacity-100 transition-all">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setPdfFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="fileInput"
                  />
                  <label 
                    htmlFor="fileInput" 
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="p-4 bg-blue-100 rounded-full mb-3">
                      <FaFile className="text-blue-600 text-xl" />
                    </div>
                    <span className="text-gray-700 font-medium">Drag files here or click to browse</span>
                    <span className="text-gray-500 text-sm mt-1">PDF, DOCX, PPT, and other files supported</span>
                  </label>
                  
                  {pdfFiles.length > 0 && (
                    <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm font-medium text-blue-700 mb-2">Selected files ({pdfFiles.length})</p>
                      <ul className="max-h-36 overflow-y-auto space-y-1">
                        {pdfFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            {file.type.includes('pdf') ? (
                              <FaFilePdf className="text-red-500" />
                            ) : (
                              <FaFile className="text-blue-500" />
                            )}
                            <span className="truncate flex-1">{file.name}</span>
                            <span className="text-gray-500 text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  {isSubmitting ? 'Submitting...' : formType === 'create' ? 'Add Lecture' : 'Update Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-100 p-2.5 rounded-full">
                <AiOutlineDelete className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                <p className="text-gray-600 mt-1">Are you sure you want to delete this lecture? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Delete Lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subsection Form Modal */}
      {showSubsectionForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-2.5 rounded-full">
                <FaPlus className="text-blue-600 text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add New Section</h2>
                <p className="text-gray-500 text-sm mt-1">Create a section within this module</p>
              </div>
            </div>
            
            <form onSubmit={handleSubsectionFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Module</label>
                <input
                  type="text"
                  value={subsectionFormData.heading}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Section Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter section title"
                  value={subsectionFormData.subheading}
                  onChange={(e) =>
                    setSubsectionFormData({ ...subsectionFormData, subheading: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubsectionForm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subheading Modal */}
      {Object.entries(showSubheadingForm).some(([key, value]) => value === true) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-2.5 rounded-full">
                <FaEdit className="text-blue-600 text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Section</h2>
                <p className="text-gray-500 text-sm mt-1">Update the name of this section</p>
              </div>
            </div>
            
            <form onSubmit={(e) => handleEditSubheadingSubmit(e, subheadingFormData.heading)} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Module</label>
                <input
                  type="text"
                  value={subheadingFormData.heading}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Section Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Edit section name"
                  value={subheadingFormData.subheading}
                  onChange={(e) => setSubheadingFormData({ ...subheadingFormData, subheading: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  onClick={() => {
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
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subheading Delete Confirmation Modal */}
      {showSubheadingDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-100 p-2.5 rounded-full">
                <AiOutlineDelete className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Confirm Section Deletion</h2>
                <p className="text-gray-600 mt-1">Are you sure you want to delete the section "{subheadingToDelete?.subheading}"?</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-red-600 font-medium flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>Warning: This will delete all lectures in this section. This action cannot be undone.</span>
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubheadingDeleteConfirm(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubheadingConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Custom scrollbar for the modals */
        .max-h-[90vh] {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) rgba(0, 0, 0, 0);
        }
        
        .max-h-[90vh]::-webkit-scrollbar {
          width: 6px;
        }
        
        .max-h-[90vh]::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
        }
        
        .max-h-[90vh]::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
        
        /* Glassmorphism utilities */
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
        }
        
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
      `}</style>
    </div>
  );
}