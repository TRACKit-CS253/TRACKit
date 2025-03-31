import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import { AiOutlineDelete } from 'react-icons/ai';
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
          })),
        }));

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
            return {
              ...post,
              replies: [...post.replies, newReply],
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

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="text-xl text-blue-500">Loading forum posts...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center w-full h-full">
      <div className="flex items-center justify-between w-full mb-6 sticky top-0 bg-[#F5F5F5] shadow-lg px-8">
        <div className="flex items-center h-[100px]">
          <div className="mr-8">
            <h1 className="text-3xl font-bold">FORUM</h1>
            <p className="text-gray-600">
              {courseDetails.code} • {courseDetails.credits} Credits •{' '}
              {courseDetails.semester}
            </p>
          </div>
          <button
            className="bg-blue-500 shadow-lg hover:scale-95 transition-all duration-200 text-white px-4 py-2 rounded-md ml-4"
            onClick={handleAddPost}
          >
            Add Post
          </button>
        </div>
        <NavLink to="/dashboard/profile">
          <CgProfile className="text-[40px] cursor-pointer hover:scale-95 transition-all duration-200 hover:text-blue-500" />
        </NavLink>
      </div>

      {showNewPostForm && (
        <div className="bg-white p-4 rounded-md shadow-md mb-6 w-[95%]">
          <form onSubmit={handleSubmitPost}>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md mb-2 px-6"
              placeholder="Your Query"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button
                className="mr-4 bg-gray-300 shadow-lg rounded-md px-4 py-2 hover:scale-95 transition-all duration-200"
                onClick={() => setShowNewPostForm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 shadow-lg text-white px-4 py-2 rounded-md duration-200 transition-all hover:scale-95"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white p-6 rounded-md shadow-md w-[95%] text-center">
          <p className="text-lg text-gray-500">No forum posts yet. Start a discussion!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-gray-200 rounded-md shadow-md mb-6 w-[95%]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 mr-2">
                    <FaUser className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{post.author}</span>
                    {post.userType === 'faculty' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Instructor
                      </span>
                    )}
                    <div className="text-xs text-gray-500">
                      {post.createdAt.toLocaleString()}
                    </div>
                  </div>
                </div>
                {(canDelete() || post.userId === currentUser?.id) && (
                  <AiOutlineDelete
                    className="text-red-600 mr-4 text-[28px] hover:scale-110 transition-all duration-200 cursor-pointer"
                    onClick={() => handleDeletePost(post.id)}
                  />
                )}
              </div>
              {post.query && (
                <div className="bg-white p-4 rounded-md mb-4">
                  <p className="whitespace-pre-line">{post.query}</p>
                </div>
              )}
              <div className="mt-4">
                <h3 className="font-medium mb-2">Replies</h3>
                {post.replies.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">No replies yet</p>
                ) : (
                  post.replies.map((reply) => (
                    <div key={reply.id} className="bg-white p-4 rounded-md mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 mr-2">
                            <FaUser className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">{reply.author}</span>
                            {reply.userType === 'faculty' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Instructor
                              </span>
                            )}
                            <div className="text-xs text-gray-500">
                              {reply.createdAt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {(canDelete() || reply.userId === currentUser?.id) && (
                          <AiOutlineDelete
                            className="text-red-600 text-[28px] hover:scale-110 transition-all duration-200 cursor-pointer"
                            onClick={() => handleDeleteReply(post.id, reply.id)}
                          />
                        )}
                      </div>
                      <p className="whitespace-pre-line">{reply.content}</p>
                    </div>
                  ))
                )}
                {replyingToPost === post.id ? (
                  <div className="bg-white p-4 rounded-md mb-2">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md mb-2"
                      rows="3"
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        className="bg-gray-300 shadow-lg text-black px-4 py-2 rounded-md hover:scale-95 transition-all duration-200"
                        onClick={handleCancelReply}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-500 hover:scale-95 transition-all duration-200 shadow-lg text-white px-4 py-2 rounded-md"
                        onClick={() => handleSubmitReply(post.id)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-2">
                    <button
                      className="bg-black text-white px-4 py-2 rounded-md hover:scale-95 transition-all duration-200 hover:bg-blue-500"
                      onClick={() => handleReplyClick(post.id)}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}