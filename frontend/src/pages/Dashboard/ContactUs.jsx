import React, { useEffect, useState } from 'react';
import { BsSend } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdOutlineErrorOutline } from "react-icons/md";
import { authFetch } from '../../services/auth';

export default function ContactUs({ name, email }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchProfileData = async () => {
        try {
            if (user) {
                const endpoint = user.userType === 'student'
                    ? `/api/student/${user.id}/profile`
                    : user.userType === 'faculty'
                        ? `/api/faculty/${user.id}/profile`
                        : `/api/users/${user.id}`;

                const result = await authFetch(endpoint);

                if (result.success) {
                    setProfileData({ ...user, ...result.data });
                    localStorage.setItem('user', JSON.stringify({ ...user, ...result.data }));
                }
            }
        } catch (err) {
            setError('Error loading profile data');
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchProfileData();
    }, [user?.id, user?.userType]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject || !formData.message) {
            setSubmitStatus({
                success: false,
                message: 'Please fill in all required fields',
            });
            return;
        }

        try {
            setSubmitStatus({ loading: true });

            // Call the backend API to send the email
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: formData.subject,
                    message: formData.message,
                    userEmail: displayData.email, // User's email
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitStatus({
                    success: true,
                    message: 'Message sent successfully!',
                });
                setFormData({ subject: '', message: '' });
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (err) {
            setSubmitStatus({
                success: false,
                message: err.message || 'Error sending message. Please try again later.',
            });
        }
    };

    const displayData = profileData || user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 px-8">
                        <h1 className="text-3xl font-bold text-white">Get in Touch</h1>
                        <p className="text-blue-100 mt-2">
                            We're here to help with any questions or concerns
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FiPhone className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="text-white text-sm opacity-80">Call us at</p>
                                    <p className="text-white font-medium">8xxxxxxxxx</p>
                                    <p className="text-xs text-blue-100">Office Hours: 10:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <HiOutlineMail className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="text-white text-sm opacity-80">Email us at</p>
                                    <p className="text-white font-medium">trackit.CS253@gmail.com</p>
                                    <p className="text-xs text-blue-100">We'll respond promptly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contact Form */}
                    <div className="p-8">
                        {/* User Information */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="text-gray-700 font-medium mb-4">Your Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Full Name
                                    </label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800">
                                        {displayData?.firstName} {displayData?.lastName}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Email Address
                                    </label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800">
                                        {displayData?.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Messages */}
                        {submitStatus?.success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                                <IoCheckmarkCircleOutline className="text-green-500 text-xl mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-800">Success!</h4>
                                    <p className="text-green-700">{submitStatus.message}</p>
                                </div>
                            </div>
                        )}
                        
                        {submitStatus?.success === false && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                <MdOutlineErrorOutline className="text-red-500 text-xl mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Error</h4>
                                    <p className="text-red-700">{submitStatus.message}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subject">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="What's this about?"
                                    id="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                    minLength={5}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder="How can we help you?"
                                    id="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[180px]"
                                    required
                                    minLength={15}
                                />
                            </div>
                            
                            <div>
                                <button
                                    type="submit"
                                    disabled={submitStatus?.loading}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70"
                                >
                                    {submitStatus?.loading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BsSend />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Supporting text */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>We value your feedback and aim to respond to all inquiries within 24-48 hours.</p>
                </div>
            </div>
        </div>
    );
}
