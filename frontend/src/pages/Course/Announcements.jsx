import React, { useState, useEffect } from 'react'
import { CgProfile } from 'react-icons/cg'
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
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
    return date.toLocaleString();
  };

  return (
    <div className='w-full h-screen overflow-y-auto'>
      {/* Show loading state while course details are loading */}
        {loading ? (
          <div className="w-full min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            Loading course details...
          </div>
        ) : (
      <>
        <div className='flex justify-between shadow-md py-2 px-8 items-center sticky top-0 bg-[#F5F5F5] z-50'>
          <div>
            <p className='text-[32px] uppercase font-semibold m-4'>Announcements</p>
            <p className='text-gray-600 ml-4 -mt-3'>
              {courseDetails?.code || 'Loading...'} • {courseDetails?.credits || ''} Credits • {courseDetails?.semester || ''}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            {role !== "student" && (
              <button 
                className='bg-blue-500 shadow-xl text-white py-2 px-4 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'
                onClick={() => {
                  setFormType('create');
                  setFormData({ announcementHeading: '', announcementBody: '' });
                  setShowForm(true);
                }}
              >
                <FaPlus className='text-[18px]' />
                <p>Add Announcement</p>
              </button>
            )}
            <NavLink to="/dashboard/profile">
              <CgProfile className='text-[40px] cursor-pointer' />
            </NavLink>
          </div>
        </div>

      <div className='p-6'> 
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div key={announcement.id} className='mb-2'>
              <div className='w-[98%] ml-6 py-3 border-2 flex flex-col px-8 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200' onClick={() => toggleExpand(index)}>
                <div className='flex justify-between w-full font-semibold'>
                  <span className='text-lg'>{announcement.announcementHeading}</span>
                  <div className='flex gap-8 items-center'>
                    {role !== "student" && (
                      <div className='flex gap-2 items-center'>
                        <button onClick={(e) => handleEditClick(e, announcement)}>
                          <FaRegEdit className='text-[22px]' />
                        </button>
                        <button onClick={(e) => handleDeleteClick(e, announcement)}>
                          <AiOutlineDelete className='text-[22px] text-red-600' />
                        </button>
                      </div>
                    )}
                    <IoIosArrowDropdown 
                      className={`text-[25px] transform transition-transform duration-500 ${
                        expandedIndices[index] ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${expandedIndices[index] ? 'max-h-96 opacity-100 py-3' : 'max-h-0 opacity-0'}`}
                >
                  <div>{announcement.announcementBody}</div>
                  <hr className="my-2 border-gray-300" />
                  <div className="text-xs text-gray-600">
                    <p>Posted by: {announcement.faculty.user.firstName} {announcement.faculty.user.lastName} ({announcement.faculty.user.username})</p>
                    <p>Created: {formatDate(announcement.createdAt)}</p>
                    {announcement.createdAt !== announcement.updatedAt &&
                      Math.abs(new Date(announcement.updatedAt) - new Date(announcement.createdAt)) >= 1000 && (
                        <p>Updated: {formatDate(announcement.updatedAt)}</p>
                    )}
                    {/* {announcement.createdAt !== announcement.updatedAt && (
                      <p>Updated: {formatDate(announcement.updatedAt)}</p>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No announcements available for this course.
          </div>
        )}
      </div>
      </>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this announcement?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAnnouncementToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Announcement Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">
              {formType === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Heading
                </label>
                <input
                  id="heading"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.announcementHeading}
                  onChange={(e) => setFormData({...formData, announcementHeading: e.target.value})}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Body
                </label>
                <textarea
                  id="body"
                  className="w-full p-2 border border-gray-300 rounded h-40"
                  value={formData.announcementBody}
                  onChange={(e) => setFormData({...formData, announcementBody: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ announcementHeading: '', announcementBody: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : formType === 'create' ? 'Post Announcement' : 'Update Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
}