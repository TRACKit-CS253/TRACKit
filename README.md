# TRACKit

**Testing Reporting Academic Comprehensive Kit**

TRACKit is a web-based college course information portal and academic management platform designed to provide a centralized system for managing courses, users, and academic data. It simplifies course management by integrating announcements, lectures, results, calendar scheduling, and forums into a single unified portal.

---

## 📑 Documentation

Please refer to the following documents for detailed information regarding the architecture, implementation, and usage of TRACKit:

*   [Software Requirement Specification](https://drive.google.com/file/d/1m6RKZWIP1PH818ApYRhYS3H0wGtK4P2y/view?usp=sharing) 
*   [Design Document](https://drive.google.com/file/d/1Yjq4K9BFsURPzGYUWChD7MSjw-5RQ5sh/view?usp=sharing) 
*   [Implementation Document](https://drive.google.com/file/d/1-Kd205RecmzJOIzse1k2mg0lv138tlyy/view?usp=sharing) 
*   [User Manual](https://drive.google.com/file/d/1sUYaszijOCtdd0cMwWikbsTqaT4zjvXe/view?usp=sharing) 

---

## ✨ Features by User Role

TRACKit supports three primary user types, each with specific role-based access controls:

### 🛡️ System Admin
*   **System & User Management:** Full control over adding, editing, or deleting student and faculty accounts (manual entry and bulk CSV upload).
*   **Course Management:** Create, modify, or remove courses from the platform.
*   **Access Control:** Assign faculty members as course instructors and enroll students into specific courses.

### 👨‍🏫 Faculty
*   **Course Dashboard:** Integrated calendar view for all scheduled academic events and quick access to assigned courses.
*   **Lecture Management:** Organize teaching content hierarchically (Headings -> Subheadings -> Lectures) and upload materials (PDFs, YouTube links, etc.).
*   **Results Management:** Publish, view, and modify exam results with automatic statistical analysis (mean, median, max, standard deviation).
*   **Announcements & Events:** Post important updates and schedule quizzes, presentations, and deadlines.
*   **Forum Interaction:** Respond to student queries and initiate academic discussions.

### 🎓 Student
*   **Unified Dashboard:** View all enrolled courses and track overall academic standing in the "Performance" tab, comparing individual scores against class medians.
*   **Course Access:** Read-only access to enrolled courses to view lectures, announcements, and personal exam scores.
*   **Interactive Forums:** Create posts, raise doubts, and engage in peer-to-peer discussions within course-specific forums.
*   **Attendance Tracking:** Monitor course-wise attendance percentages directly from the course home page.

---

## 🛠️ Tech Stack

TRACKit is built using a modern, robust tech stack selected for performance and community support:

*   **Frontend:** React + Tailwind CSS (Component-based architecture with utility-first styling).
*   **Backend:** Node.js + Express.js (Event-driven I/O with lightweight routing).
*   **Database:** PostgreSQL / SQLite via **Sequelize ORM** (Provides an abstraction layer for easy model definition and querying).
*   **Authentication & Security:** 
    *   **JWT (JSON Web Tokens):** Stateless authentication.
    *   **bcryptjs:** Secure password hashing and salting.
    *   **Helmet.js:** HTTP header security.
    *   **express-rate-limit:** Mitigation against brute-force attacks.

---

## 📁 Codebase Structure

The repository is divided into two main environments:

```text
TRACKit/
├── backend/                  # Node.js + Express backend
│   ├── config/               # Database configurations
│   ├── controllers/          # Route controller logic
│   ├── middleware/           # Auth and upload middleware
│   ├── models/               # Sequelize database models
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Backend entry point
└── frontend/                 # React frontend
    ├── public/               # Static assets
    ├── src/                  # React components, pages, contexts, and services
    └── package.json          # Frontend dependencies
