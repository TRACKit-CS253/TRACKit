import React, { useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDropdown, IoMdMegaphone } from "react-icons/io";
import { FaPlus, FaRegEdit, FaCalendarAlt } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageDetail } from "react-icons/bi";
import { BsPersonCircle, BsPinAngleFill } from "react-icons/bs";
import { NavLink } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

export default function Announcements({ role }) {
  const [expandedIndices, setExpandedIndices] = useState({});
  const { courseDetails, loading, error } = useCourse();
  const { showNotification } = useNotification();
  const [announcements, setAnnouncements] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    announcementHeading: '',
    announcementBody: ''
  });
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleExpand = (index) => {
    setExpandedIndices(prev => ({ ...prev, [index]: !prev[index] }));
  };
  
  useEffect(() => {
    if (courseDetails?.id) {
      fetchAnnouncements();
    }
  }, [courseDetails]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/announcements/course/${courseDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setAnnouncements(response.data.data);
      } else {
        showNotification('Failed to fetch announcements', 'error');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      showNotification('Error loading announcements', 'error');
    }
  };

  const handleEditClick = (e, announcement) => {
    e.stopPropagation();
    setFormType('edit');
    setFormData({
      announcementHeading: announcement.announcementHeading,
      announcementBody: announcement.announcementBody
    });
    setCurrentAnnouncementId(announcement.id);
    setShowForm(true);
  };

  const handleDeleteClick = (e, announcement) => {
    e.stopPropagation();
    setAnnouncementToDelete(announcement);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/announcements/${courseDetails.id}/${announcementToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        showNotification('Announcement deleted successfully', 'success');
        setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete.id));
      } else {
        showNotification('Failed to delete announcement', 'error');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showNotification('Error deleting announcement', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (formType === 'create') {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/announcements`,
          {
            courseId: courseDetails.id,
            announcementHeading: formData.announcementHeading,
            announcementBody: formData.announcementBody
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          showNotification('Announcement created successfully', 'success');
          // Refresh announcements to get the new one with all details
          fetchAnnouncements();
        }
      } else if (formType === 'edit') {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/announcements/${courseDetails.id}/${currentAnnouncementId}`,
          {
            announcementHeading: formData.announcementHeading,
            announcementBody: formData.announcementBody
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          showNotification('Announcement updated successfully', 'success');
          // Update the announcement in our state
          setAnnouncements(prev => 
            prev.map(a => {
              if (a.id === currentAnnouncementId) {
                return {
                  ...a,
                  announcementHeading: formData.announcementHeading,
                  announcementBody: formData.announcementBody,
                  updatedAt: new Date().toISOString()
                };
              }
              return a;
            })
          );
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      showNotification(`Error ${formType === 'create' ? 'creating' : 'updating'} announcement`, 'error');
    } finally {
      setIsSubmitting(false);
      setShowForm(false);
      setFormData({ announcementHeading: '', announcementBody: '' });
      setCurrentAnnouncementId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get time elapsed since post
  const getTimeElapsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    
    if (diff < 60) {
      return 'Just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diff < 2592000) {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Function to determine if announcement is recent (less than 24 hours)
  const isRecent = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    return diff < 86400; // 24 hours in seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Glassy Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white bg-opacity-70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <IoMdMegaphone className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails?.code || 'Loading...'}</span>
                  <span className="text-gray-500 text-sm">{courseDetails?.credits || ''} Credits • {courseDetails?.semester || ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {role !== "student" && (
                <button 
                  onClick={() => {
                    setFormType('create');
                    setFormData({ announcementHeading: '', announcementBody: '' });
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FaPlus /> New Announcement
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : (
          <>
            {announcements.length > 0 ? (
              <div className="space-y-5">
                {announcements.map((announcement, index) => (
                  <div key={announcement.id}
                    className="backdrop-blur-lg bg-white bg-opacity-70 border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div 
                      onClick={() => toggleExpand(index)}
                      className="flex justify-between items-center p-5 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Indicator for recent announcements */}
                        {isRecent(announcement.createdAt) && (
                          <div className="min-w-fit h-fit bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">NEW</div>
                        )}
                        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                          {announcement.announcementHeading}
                        </h3>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        {role !== "student" && (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => handleEditClick(e, announcement)}
                              className="p-1.5 hover:bg-blue-50 rounded-full transition-all"
                              title="Edit Announcement"
                            >
                              <FaRegEdit className="text-blue-600" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(e, announcement)}
                              className="p-1.5 hover:bg-red-50 rounded-full transition-all"
                              title="Delete Announcement"
                            >
                              <AiOutlineDelete className="text-red-500" />
                            </button>
                          </div>
                        )}
                        <div className={`transform transition-transform duration-300 ${expandedIndices[index] ? 'rotate-180' : ''}`}>
                          <IoIosArrowDropdown className="text-gray-500 text-2xl" />
                        </div>
                      </div>
                    </div>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedIndices[index] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-5 pb-5">
                        {/* Glassy separator */}
                        <div className="border-t border-gray-200 mb-4"></div>
                        
                        {/* Announcement body with proper formatting */}
                        <div className="prose prose-sm max-w-none text-gray-700 mb-4 whitespace-pre-line">
                          {announcement.announcementBody}
                        </div>
                        
                        {/* Meta information in a glassy card */}
                        <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-lg border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 rounded-full p-2">
                              <BsPersonCircle className="text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-700">
                              {announcement.faculty.user.firstName} {announcement.faculty.user.lastName} 
                              <span className="text-gray-500 text-xs ml-1">({announcement.faculty.user.username})</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center text-xs text-gray-500">
                              <FaCalendarAlt className="mr-1" />
                              <span title={formatDate(announcement.createdAt)}>
                                {getTimeElapsed(announcement.createdAt)}
                              </span>
                            </div>
                            
                            {announcement.createdAt !== announcement.updatedAt && 
                             Math.abs(new Date(announcement.updatedAt) - new Date(announcement.createdAt)) >= 1000 && (
                              <div className="text-xs text-gray-500">
                                <span title={formatDate(announcement.updatedAt)}>
                                  Updated {getTimeElapsed(announcement.updatedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="backdrop-blur-lg bg-white bg-opacity-60 rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BiMessageDetail className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Announcements Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {role === "student" 
                    ? "There are no announcements for this course yet. Check back later." 
                    : "Start communicating with your students by creating your first announcement."}
                </p>
                {role !== "student" && (
                  <button 
                    onClick={() => {
                      setFormType('create');
                      setFormData({ announcementHeading: '', announcementBody: '' });
                      setShowForm(true);
                    }}
                    className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all inline-flex items-center gap-2"
                  >
                    <FaPlus />
                    Create First Announcement
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md z-[200]" 
               data-modal-backdrop="true" 
               onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AiOutlineDelete className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Announcement</h3>
                  <p className="text-gray-600">Are you sure you want to delete this announcement? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setAnnouncementToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Announcement Form */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md z-[200]" 
               data-modal-backdrop="true" 
               onClick={() => setShowForm(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-xl max-w-3xl w-full p-6 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className={`bg-${formType === 'create' ? 'blue' : 'green'}-100 p-3 rounded-full`}>
                  {formType === 'create' ? 
                    <FaPlus className="text-blue-600 text-xl" /> : 
                    <FaRegEdit className="text-green-600 text-xl" />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {formType === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {formType === 'create' ? 
                      'Create a new announcement to inform your students' : 
                      'Update the existing announcement content'
                    }
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Title
                  </label>
                  <input
                    id="heading"
                    type="text"
                    className="w-full px-4 py-3 bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.announcementHeading}
                    onChange={(e) => setFormData({...formData, announcementHeading: e.target.value})}
                    placeholder="Enter a clear, descriptive title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Content
                  </label>
                  <textarea
                    id="body"
                    className="w-full px-4 py-3 bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[200px]"
                    value={formData.announcementBody}
                    onChange={(e) => setFormData({...formData, announcementBody: e.target.value})}
                    placeholder="Enter the announcement details here..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ announcementHeading: '', announcementBody: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-5 py-2.5 bg-gradient-to-r ${
                      formType === 'create' 
                        ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                        : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    } text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    )}
                    {isSubmitting 
                      ? 'Submitting...' 
                      : formType === 'create' 
                        ? 'Post Announcement' 
                        : 'Update Announcement'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      
      {/* Add glassmorphism styles */}
      <style jsx global>{`
        /* Glassmorphism effect for cards */
        .backdrop-blur-lg {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        
        /* Smooth height transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Custom scrollbar for modals */
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
          border-radius: 10px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 10px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }

        /* Standardized modal backdrop transitions */
        .fixed.inset-0.bg-gray-900,
        .fixed.inset-0.bg-black,
        [data-modal-backdrop="true"],
        #file-download-backdrop {
          transition: opacity 150ms ease-out;
        }
        
        /* Ensure all blur effects have the same duration and timing */
        .backdrop-blur-md,
        .backdrop-blur-sm,
        .backdrop-blur-lg {
          transition: backdrop-filter 150ms ease-out;
        }
      `}</style>
    </div>
  );
}