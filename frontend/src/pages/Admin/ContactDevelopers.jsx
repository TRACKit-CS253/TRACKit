import { useNavigate } from "react-router-dom";
import { useState } from "react";
import profilePic from "../../assets/icon-7797704.png";
import { FaLinkedin, FaWhatsapp, FaEnvelope, FaPhone, FaRegUser, FaGithub } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const developers = [
  {
    id: 3,
    name: "Ved Prakash Vishwakarma",
    role: "Full Stack Engineer",
    phone: "+91-98765-4323",
    email: "pved@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 1,
    name: "Aditya Gautam",
    role: "UI Designer",
    phone: "+91-98765-4321",
    email: "gaditiya@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 2,
    name: "Sharique Ahmad",
    role: "Backend Developer",
    phone: "+91-98765-4322",
    email: "asharique@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 4,
    name: "Dhruv Varshney",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "vdhruv@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 5,
    name: "Dhruv Rai",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "rdhruv@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 6,
    name: "Mayur",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "mayur@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 7,
    name: "Abhijeet Agarwal",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "abhijeet@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 8,
    name: "Aaayush Singh",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "aayush@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 9,
    name: "Aryan Bansal",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "aryan@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
  {
    id: 10,
    name: "Rahul Ahriwar",
    role: "DevOps Engineer",
    phone: "+91-98765-4324",
    email: "rahul@example.com",
    linkedin: "https://www.google.com",
    whatsapp: "https://www.google.com"
  },
];

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
        return "from-purple-500 to-pink-500";
      case "backend developer":
        return "from-green-500 to-teal-500";
      case "full stack engineer":
        return "from-blue-500 to-indigo-600";
      case "devops engineer":
      default:
        return "from-amber-500 to-orange-500";
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
              whileHover={{ scale: 1.05 }}
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
              className="relative"
              onMouseEnter={() => setHoveredCard(dev.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div 
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -8 }}
              >
                {/* Card header with gradient */}
                <div className={`h-8 bg-gradient-to-r ${getRoleStyle(dev.role)}`}></div>
                
                {/* Profile section */}
                <div className="relative flex flex-col items-center pt-12 pb-6 px-6">
                  {/* Avatar */}
                  <div className="absolute -top-10 rounded-full p-1 bg-white shadow-md">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                      <motion.img 
                        src={profilePic} 
                        alt={dev.name} 
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                      />
                    </div>
                  </div>
                  
                  {/* Developer info */}
                  <h3 className="text-xl font-bold text-gray-800 mt-2 text-center">{dev.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 bg-gradient-to-r ${getRoleStyle(dev.role)} text-white`}>
                    {dev.role}
                  </span>
                  
                  {/* Contact info */}
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-100 rounded-full p-2">
                        <FaPhone className="text-gray-500" size={14} />
                      </div>
                      <span className="text-sm">{dev.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-100 rounded-full p-2">
                        <FaEnvelope className="text-gray-500" size={14} />
                      </div>
                      <span className="text-sm truncate">{dev.email}</span>
                    </div>
                  </div>
                  
                  {/* Social links */}
                  <div className="flex justify-center gap-3 mt-5">
                    <motion.a 
                      href={dev.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 p-2.5 rounded-full text-blue-600"
                      whileHover={{ scale: 1.15, backgroundColor: "#dbeafe" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaLinkedin size={18} />
                    </motion.a>
                    
                    <motion.a 
                      href={dev.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-100 p-2.5 rounded-full text-green-600"
                      whileHover={{ scale: 1.15, backgroundColor: "#dcfce7" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaWhatsapp size={18} />
                    </motion.a>
                    
                    <motion.a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 p-2.5 rounded-full text-gray-700"
                      whileHover={{ scale: 1.15, backgroundColor: "#f3f4f6" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaGithub size={18} />
                    </motion.a>
                  </div>
                </div>
                
                {/* Contact button */}
                <div className="px-6 pb-6">
                  <motion.button
                    onClick={() => handleContactClick(dev.email)}
                    className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${getRoleStyle(dev.role)} text-white font-medium`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Contact Me
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Rising particles effect on hover */}
              {hoveredCard === dev.id && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${getRoleStyle(dev.role)}`}
                      initial={{
                        x: Math.random() * 100 - 50 + 50,
                        y: 80,
                        opacity: 0,
                        scale: 0.2
                      }}
                      animate={{
                        y: -100,
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 1, delay: i * 0.1 }
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
