import React, { useState, useEffect } from 'react';
import { FaUser, FaReply, FaPaperPlane, FaPlus, FaSort } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineForum, MdFilterList } from 'react-icons/md';
import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

export default function Forum({ role }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [replyingToPost, setReplyingToPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterByRole, setFilterByRole] = useState('all');

  const { courseDetails } = useCourse();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (courseDetails?.id) {
      fetchPosts();
    }
  }, [courseDetails]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/forum/course/${courseDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const formattedPosts = response.data.data.map((post) => ({
          id: post.id,
          author: post.user.username,
          query: post.query,
          userId: post.userId,
          userType: post.user.userType,
          createdAt: new Date(post.createdAt),
          replies: post.replies.map((reply) => ({
            id: reply.id,
            author: reply.user.username,
            content: reply.content,
            userId: reply.userId,
            userType: reply.user.userType,
            createdAt: new Date(reply.createdAt),
          })).sort((a, b) => b.createdAt - a.createdAt),
        }));

        formattedPosts.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(formattedPosts);
      } else {
        showNotification('Failed to fetch forum posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showNotification('Error loading forum posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = () => {
    setShowNewPostForm(true);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forum/course/${courseDetails.id}`,
        { query: newQuery },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const newPost = {
          id: response.data.data.id,
          author: currentUser.username,
          query: response.data.data.query,
          userId: currentUser.id,
          userType: currentUser.userType,
          createdAt: new Date(),
          replies: [],
        };

        setPosts([newPost, ...posts]);
        setNewQuery('');
        setShowNewPostForm(false);
        showNotification('Post created successfully', 'success');
      } else {
        showNotification('Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showNotification('Error creating post', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/forum/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        showNotification('Post deleted successfully', 'success');
      } else {
        showNotification('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Error deleting post', 'error');
    }
  };

  const handleReplyClick = (postId) => {
    setReplyingToPost(postId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToPost(null);
    setReplyContent('');
  };

  const handleSubmitReply = async (postId) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forum/post/${postId}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const newReply = {
          id: response.data.data.id,
          author: currentUser.username,
          content: response.data.data.content,
          userId: currentUser.id,
          userType: currentUser.userType,
          createdAt: new Date(),
        };

        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            const updatedReplies = [newReply, ...post.replies];
            return {
              ...post,
              replies: updatedReplies,
            };
          }
          return post;
        });

        setPosts(updatedPosts);
        setReplyingToPost(null);
        setReplyContent('');
        showNotification('Reply added successfully', 'success');
      } else {
        showNotification('Failed to add reply', 'error');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showNotification('Error adding reply', 'error');
    }
  };

  const handleDeleteReply = async (postId, replyId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/forum/reply/${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                replies: post.replies.filter((reply) => reply.id !== replyId),
              };
            }
            return post;
          })
        );

        showNotification('Reply deleted successfully', 'success');
      } else {
        showNotification('Failed to delete reply', 'error');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      showNotification('Error deleting reply', 'error');
    }
  };

  const canDelete = () => {
    return currentUser?.userType === 'faculty' || currentUser?.userType === 'admin';
  };

  // Format time elapsed since post
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
      return date.toLocaleDateString();
    }
  };
  
  // Filter and sort posts
  const filteredAndSortedPosts = React.useMemo(() => {
    let filtered = [...posts];
    
    // Apply role filter
    if (filterByRole !== 'all') {
      filtered = filtered.filter(post => post.userType === filterByRole);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'most-replies') {
      filtered.sort((a, b) => b.replies.length - a.replies.length);
    }
    
    return filtered;
  }, [posts, sortBy, filterByRole]);
  
  // Count total replies
  const totalReplies = posts.reduce((sum, post) => sum + post.replies.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Modern Header - Now appears immediately regardless of loading state */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white bg-opacity-70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MdOutlineForum className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Course Forum</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails?.code || 'Loading...'}</span>
                  <span className="text-gray-500 text-sm">{courseDetails?.credits || ''} Credits • {courseDetails?.semester || ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddPost}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FaPlus/> New Discussion
              </button>
              
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xl font-medium text-gray-700">Loading forum discussions...</p>
          </div>
        ) : (
          <>
            {/* Forum stats and filters */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-blue-600">{posts.length}</p>
                  <p className="text-sm text-gray-600">Discussions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-blue-600">{totalReplies}</p>
                  <p className="text-sm text-gray-600">Replies</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-replies">Most Replies</option>
                  </select>
                  <FaSort className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                </div>
                
                <div className="relative">
                  <select
                    className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={filterByRole}
                    onChange={(e) => setFilterByRole(e.target.value)}
                  >
                    <option value="all">All Posts</option>
                    <option value="faculty">Instructor Only</option>
                    <option value="student">Students Only</option>
                  </select>
                  <MdFilterList className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* New Post Form */}
            {showNewPostForm && (
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md mb-6 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaPlus className="text-blue-500 text-sm" />
                    <span>New Discussion</span>
                  </h2>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowNewPostForm(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmitPost} className="p-6">
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="What would you like to discuss?"
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    rows="5"
                    required
                  ></textarea>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      onClick={() => setShowNewPostForm(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                    >
                      <FaPaperPlane className="text-sm" />
                      Post Discussion
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* No Posts State */}
            {filteredAndSortedPosts.length === 0 ? (
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-12 mb-6 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdOutlineForum className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No discussions yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {filterByRole !== 'all' ? 
                    `No posts from ${filterByRole === 'faculty' ? 'instructors' : 'students'} yet.` : 
                    "Be the first to start a discussion in this course forum."
                  }
                </p>
                <button 
                  onClick={handleAddPost}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <FaPlus />
                  Start a New Discussion
                </button>
              </div>
            ) : (
              // Post List
              <div className="space-y-6">
                {filteredAndSortedPosts.map((post) => (
                  <div key={post.id} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Post Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            post.userType === 'faculty' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <FaUser className="text-lg" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{post.author}</span>
                              {post.userType === 'faculty' && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                  Instructor
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{getTimeElapsed(post.createdAt)}</p>
                          </div>
                        </div>
                        {(canDelete() || post.userId === currentUser?.id) && (
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete post"
                          >
                            <AiOutlineDelete className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Post Content */}
                    <div className="p-5">
                      <p className="text-gray-800 whitespace-pre-line mb-5">{post.query}</p>
                      
                      {/* Reply button */}
                      <div className="flex justify-end">
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                          onClick={() => handleReplyClick(post.id)}
                        >
                          <FaReply className="text-sm" />
                          Reply
                        </button>
                      </div>
                    </div>
                    
                    {/* Replies Section */}
                    {(post.replies.length > 0 || replyingToPost === post.id) && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                        </h3>
                        
                        {/* Reply Form */}
                        {replyingToPost === post.id && (
                          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 animate-fade-in">
                            <textarea
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              rows="3"
                              placeholder="Write your reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
                                onClick={handleCancelReply}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1.5 text-sm"
                                onClick={() => handleSubmitReply(post.id)}
                              >
                                <FaPaperPlane className="text-xs" />
                                Submit
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Reply List */}
                        <div className="space-y-3">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    reply.userType === 'faculty' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    <FaUser className="text-sm" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium text-gray-800">{reply.author}</span>
                                      {reply.userType === 'faculty' && (
                                        <span className="inline-flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">
                                          Instructor
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">{getTimeElapsed(reply.createdAt)}</p>
                                  </div>
                                </div>
                                {(canDelete() || reply.userId === currentUser?.id) && (
                                  <button
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    onClick={() => handleDeleteReply(post.id, reply.id)}
                                    title="Delete reply"
                                  >
                                    <AiOutlineDelete className="text-base" />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-800 whitespace-pre-line text-sm">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}