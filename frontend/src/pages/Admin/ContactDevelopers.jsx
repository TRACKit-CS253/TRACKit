import { useNavigate } from "react-router-dom";
import { useState } from "react";
import profilePic from "../../assets/icon-7797704.png";
import { FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaRegUser, FaGithub } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import developers from "./Developers";

export default function ContactDevelopers() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleContactClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  // Role-based gradient styles
  const getRoleStyle = (role) => {
    switch(role.toLowerCase()) {
      case "ui designer":
        return "from-blue-500 to-indigo-600";
      case "backend developer":
        return "from-blue-500 to-indigo-600";
      case "full stack engineer":
        return "from-blue-500 to-indigo-600";
      case "devops engineer":
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  // Card container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Card item animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
            >
              TRACKit 
            </motion.span>
            <motion.div 
              className='cursor-pointer rounded-full bg-gray-50 hover:bg-gray-100 p-3 shadow-sm'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={()=> navigate("/Admin")}
            >
              <GoHome className='text-[1.5rem] text-gray-700'></GoHome>
            </motion.div>
          </div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text">
            Contact Developers
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

      {/* Team section header */}
      <div className="pt-28 px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text inline-block mb-3">
            Meet Our Development Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our talented team has worked diligently to create TRACKit. Feel free to reach out to any of us with questions, suggestions, or just to say hello!
          </p>
        </motion.div>
      
        {/* Developer cards grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {developers.map((dev) => (
            <motion.div
              key={dev.id}
              variants={cardVariants}
              className="relative group"
              onMouseEnter={() => setHoveredCard(dev.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Enhanced card with layered animations */}
              <motion.div 
                className="bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300 relative z-10"
                initial={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileHover={{ 
                  y: -12, 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
              >
                {/* Add a glow effect behind the card that appears on hover */}
                <motion.div 
                  className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r ${getRoleStyle(dev.role)} opacity-0 blur-xl`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ 
                    opacity: 0.15, 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                />

                {/* Card header with gradient - now with animation */}
                <motion.div 
                  className={`h-8 bg-gradient-to-r ${getRoleStyle(dev.role)}`}
                  whileHover={{
                    height: "2.25rem", // slightly expand header on hover
                    transition: { duration: 0.2 }
                  }}
                />
                
                {/* Profile section */}
                <div className="relative flex flex-col items-center pt-12 pb-6 px-6">
                  {/* Animated Avatar */}
                  <motion.div 
                    className="absolute -top-10 rounded-full p-1 bg-white shadow-md z-20"
                    whileHover={{ scale: 1.08, y: -2, transition: { type: "spring", stiffness: 400 } }}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                      <motion.div className="w-full h-full overflow-hidden">
                        <motion.img 
                          src={dev.image || profilePic} 
                          alt={dev.name} 
                          className="w-full h-full object-cover"
                          whileHover={{ 
                            scale: 1.15,
                            transition: { duration: 0.5 }
                          }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Developer info with subtle animations */}
                  <motion.h3 
                    className="text-xl font-bold text-gray-800 mt-2 text-center"
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  >
                    {dev.name}
                  </motion.h3>
                  
                  <motion.span 
                    className={`inline-block font-semibold px-3 py-1 rounded-full text-xs mt-1 bg-gradient-to-r ${getRoleStyle(dev.role)} text-white`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {dev.role}
                  </motion.span>
                  
                  {/* Contact info with subtle reveal animation */}
                  <motion.div 
                    className="w-full mt-6 space-y-3"
                    initial={{ opacity: 0.9 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="flex items-center gap-3 text-gray-600"
                      whileHover={{ x: 2, transition: { duration: 0.2 } }}
                    >
                      <motion.div 
                        className="bg-gray-100 rounded-full p-2"
                        whileHover={{ 
                          backgroundColor: "#e0e7ff", 
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <FaPhone className="text-gray-500" size={14} />
                      </motion.div>
                      <span className="text-sm">{dev.phone}</span>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 text-gray-600"
                      whileHover={{ x: 2, transition: { duration: 0.2 } }}
                    >
                      <motion.div 
                        className="bg-gray-100 rounded-full p-2"
                        whileHover={{ 
                          backgroundColor: "#e0e7ff", 
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <FaEnvelope className="text-gray-500" size={14} />
                      </motion.div>
                      <span className="text-sm truncate">{dev.email}</span>
                    </motion.div>
                  </motion.div>
                  
                  {/* Social links with enhanced animations */}
                  <div className="flex justify-center gap-3 mt-5">
                    <motion.a 
                      href={dev.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 p-2.5 rounded-full text-blue-600"
                      whileHover={{ 
                        scale: 1.2, 
                        backgroundColor: "#dbeafe", 
                        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.15)",
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaLinkedin size={18} />
                    </motion.a>
                    
                    <motion.a 
                      href={dev.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-100 p-2.5 font-semibold rounded-full text-red-400"
                      whileHover={{ 
                        scale: 1.2, 
                        backgroundColor: "#fee2e2", 
                        boxShadow: "0 0 0 4px rgba(248, 113, 113, 0.15)",
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaInstagram size={18} />
                    </motion.a>
                    
                    <motion.a 
                      href={dev.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 p-2.5 rounded-full text-gray-700"
                      whileHover={{ 
                        scale: 1.2, 
                        backgroundColor: "#f3f4f6", 
                        boxShadow: "0 0 0 4px rgba(75, 85, 99, 0.15)",
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaGithub size={18} />
                    </motion.a>
                  </div>
                </div>
                
                {/* Contact button with enhanced animation */}
                <div className="px-6 pb-6">
                  <motion.button
                    onClick={() => handleContactClick(dev.email)}
                    className={`w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r ${getRoleStyle(dev.role)} text-white font-medium relative overflow-hidden`}
                    whileHover={{ 
                      scale: 1.03,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Add shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 w-full h-full bg-white opacity-0"
                      initial={{ x: "-100%", opacity: 0 }}
                      whileHover={{ 
                        x: "100%", 
                        opacity: 0.15,
                        transition: { duration: 0.8, ease: "easeInOut" }
                      }}
                    />
                    Contact Me
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Enhanced particles effect */}
              {hoveredCard === dev.id && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* More particles with varied sizes and animations */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-${i % 3 === 0 ? '3' : '2'} h-${i % 3 === 0 ? '3' : '2'} rounded-full bg-gradient-to-r ${getRoleStyle(dev.role)}`}
                      initial={{
                        x: 100 + Math.random() * 100 - 50,
                        y: 100 + Math.random() * 50,
                        opacity: 0,
                        scale: 0.2
                      }}
                      animate={{
                        y: -150 - Math.random() * 100,
                        x: 100 + Math.random() * 150 - 75,
                        opacity: [0, 0.8, 0],
                        scale: [0.2, i % 3 === 0 ? 1.2 : 0.8, 0.1],
                        transition: { 
                          duration: 1.5 + Math.random() * 1.5, 
                          delay: i * 0.08,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2
                        }
                      }}
                    />
                  ))}
                  
                  {/* Add glow effect around the card */}
                  <motion.div
                    className={`absolute -inset-4 rounded-3xl opacity-0 bg-gradient-to-r ${getRoleStyle(dev.role)} blur-xl z-0`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.08, 0.05, 0.08, 0],
                      scale: [0.95, 1.05, 1, 1.05, 0.95],
                      transition: { duration: 4, repeat: Infinity }
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Copyright Footer */}
      <motion.div 
        className="mt-16 py-8 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-1">
                TRACKit
              </h3>
              <p className="text-sm text-gray-600">
                Testing Reporting Academic Comprehensive Kit
              </p>
            </div>
            
            <div className="text-sm text-center md:text-right text-gray-600">
              <p className="mb-1">© {new Date().getFullYear()} TRACKit. All rights reserved.</p>
              <p>
                <span>Made with </span>
                <span className="inline-block animate-pulse text-red-500">❤</span>
                <span> at IIT Kanpur</span>
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500">
              Version 2.0.0 | Last updated: April 2025
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#privacy" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#legal" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Legal</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
