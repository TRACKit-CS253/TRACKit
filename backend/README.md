# TRACKit Backend

TRACKit is a college course information portal that provides a centralized system for managing courses, users, and academic information.

## Overview

The backend of TRACKit provides a secure API for course management, user authentication, and role-based access control. This system supports three user types: Admin, Faculty, and Student, each with different permissions and capabilities.

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (JSON Web Token)
- **Security**: bcryptjs for password hashing, Helmet.js for HTTP headers
- **Rate Limiting**: express-rate-limit to prevent brute-force attacks

## How to run the server

1. Clone the repo.

After cloning the repository, you need to create a `.env` file in the backend directory with the following variables:

```
PORT=3001
JWT_SECRET=your_secure_random_string_here
NODE_ENV=development
DB_PATH=./database.sqlite
FORCE_SYNC = 'true'
NODE_ENV = 'development'
```

Replace `your_secure_random_string_here` with a strong random string to secure your JWT tokens.

2. run `npm install` in terminal.

3. run `npm start` in terminal.

## Database

The application uses SQLite by default. The database file (database.sqlite) will be
automatically created in the backend directory when the server first runs. This file
is excluded from version control.
In the future, it will be upgraded to a more robust database like MySQL or PostgreSQL.

> **Note**: The `.env` file contains sensitive information and should never be committed to version control.

## Default State

The system automatically creates a default state with 1 Admin, 2 Courses, 2 Faculty and 5 Students. Their login credentials will be printed in your console/terminal. A database called `database.sqlite` should get created in this backend folder on your local machine. 
This default state is being created by `backend/utils/initState.js`


## How to send requests?

In general, to find how to get/do something, first start tracing the url from server.js, then look to the correct routes.js file according to your requirement.

For example,

### Login

#### Method:

`POST`

#### URL:

`http://localhost:3000/api/auth/login`

#### Headers:

Key: `Content-Type`
Value: `application/json`

#### Body:

```json
{
  "username": "faculty1",
  "password": "faculty123"
}
```

### Get Announcements

(Need to first login into an account associated with course, and copy the token received from the server)

#### Method:

`GET`

#### URL:

`http://localhost:3000/api/announcements/course/1`

#### Headers:

Key: `Authorization`
Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlclR5cGUiOiJmYWN1bHR5IiwiaWF0IjoxNzQxNjgyNTgzLCJleHAiOjE3NDE3Njg5ODN9.fQjsAcAfZWRVFLLNC_L8Az9ysQQB6PNhTc8FdpsK1dc`

(Replace the token with your actual token)

### Create Announcements as a Faculty

(Need to first login into an account associated with course, and copy the token received from the server)

#### Method:

`POST`

#### URL:

`http://localhost:3000/api/announcements`

#### Headers (2 Headers):

Key: `Content-Type`
Value: `application/json`

Key: `Authorization`
Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlclR5cGUiOiJmYWN1bHR5IiwiaWF0IjoxNzQxNjgyNTgzLCJleHAiOjE3NDE3Njg5ODN9.fQjsAcAfZWRVFLLNC_L8Az9ysQQB6PNhTc8FdpsK1dc`

(Replace the token with your actual token)

#### Body:

```json
{
  "courseId": 1,
  "announcementHeading": "Announcement: This Works!",
  "announcementBody": "As you can see, this works!"
}
```
