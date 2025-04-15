# TRACKit

TRACKit is a web application that provides interfaces for students, instructors, and administrators. It consists of a React-based frontend styled with Tailwind CSS and a backend server (e.g., Node.js/Express). This guide will help new developers set up and run both parts of the project.

---

## Project Structure

- **frontend/**: Contains the React application.
  - **assets/**: Images and textures.
  - **components/**: Reusable React components (e.g., CourseMenu, DashBoardMenu).
  - **pages/**: Page components grouped by route (e.g., Admin, Login, Dashboard, Course).
- **backend/**: Contains the backend server code that provides API endpoints  
  _(*Note: If a backend folder is not present, refer to the project documentation for backend details.*)_

---

## Setup & Usage

### 1. Clone the Repository

```sh
git clone https://github.com/TRACKit-CS253/TRACKit.git
```

### 2. Setup the Frontend

Navigate to the `frontend` folder and install the required packages:

```sh
cd TRACKit/frontend
npm install
```

#### Configure the Connection to the Backend

Create a `.env` file in the `frontend/` directory (if not already present) and add the following (adjust as needed):

```env
BACKEND_URL=http://localhost:3001
```

This variable tells the frontend where to send its API requests.

#### Start the Frontend Server

Start the development server by running:

```sh
npm start
```

The frontend will be available at: [http://localhost:3000](http://localhost:3000)

## Available Routes

### Frontend Routes

#### General Routes

- **Login Page:**  
  [http://localhost:3000/login](http://localhost:3000/login)
- **Admin Dashboard:**  
  [http://localhost:3000/admin](http://localhost:3000/admin)
- **User Dashboard:**  
  Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the main dashboard, which includes:
  - **My Courses:** [http://localhost:3000/dashboard/courses](http://localhost:3000/dashboard/courses)
  - **Performance:** [http://localhost:3000/dashboard/performance](http://localhost:3000/dashboard/performance)
  - **Profile:** [http://localhost:3000/dashboard/profile](http://localhost:3000/dashboard/profile)
  - **Contact Us:** [http://localhost:3000/dashboard/contactus](http://localhost:3000/dashboard/contactus)

#### Course Routes (nested under Dashboard)

Within the courses section, the following routes are available:

- **Course Home:**  
  [http://localhost:3000/dashboard/courses/coursehome](http://localhost:3000/dashboard/courses/coursehome)
- **Lectures:**  
  [http://localhost:3000/dashboard/courses/lectures](http://localhost:3000/dashboard/courses/lectures)
- **Announcements:**  
  [http://localhost:3000/dashboard/courses/announcements](http://localhost:3000/dashboard/courses/announcements)
- **Calendar:**  
  [http://localhost:3000/dashboard/courses/calendar](http://localhost:3000/dashboard/courses/calendar)
- **Results:**  
  [http://localhost:3000/dashboard/courses/result](http://localhost:3000/dashboard/courses/result)
- **Forum:**  
  [http://localhost:3000/dashboard/courses/forum](http://localhost:3000/dashboard/courses/forum)

### Backend API Endpoints

Your backend API endpoints may include (refer to specific backend documentation):

- **User Authentication:** `POST /api/auth/login`
- **Courses:** `GET /api/courses`
- **Forum:** `POST /api/forum` / `GET /api/forum`
- _... and more._

---

## How to access course parameters?
Each course has certain basic parameters (not to be confused with each courses announcements, forum posts etc. – they are in a separate table in the database.)
These are received after faculty/student login in a JSON that looks like this:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "code": "EE321",
            "name": "Communication Systems",
            "description": "Introduction to signals and systems, discrete-time signals, linear time-invariant systems, z-transforms, Fourier analysis, and other aspects of communication systems.",
            "credits": 4,
            "semester": "Fall 2023",
            "createdAt": "2025-03-16T10:46:26.511Z",
            "updatedAt": "2025-03-16T10:46:26.511Z"
        },
        {
            "id": 2,
            "code": "CS253",
            "name": "Software Development",
            "description": "Software development methodologies, design patterns, testing strategies, version control systems, and project management.",
            "credits": 3,
            "semester": "Fall 2023",
            "createdAt": "2025-03-16T10:46:26.513Z",
            "updatedAt": "2025-03-16T10:46:26.513Z"
        }
    ]
}
```
These parameters, most importantly the id of the course, required to access its associated APIs, can be accessed in any of the 6 course pages using `courseDetails.id`, `courseDetails.code`, and so on.



## Development

- **React Components & Routing:**  
  The main routes are defined in `App.jsx` with nested routes inside various Dashboard and Course components.
- **Styling:**  
  The project is styled with Tailwind CSS. Adjust styles in the component files or create custom CSS as needed.
- **Environment Variables:**  
  Both the frontend and backend use environment variables to determine API URLs and configuration parameters.

---
