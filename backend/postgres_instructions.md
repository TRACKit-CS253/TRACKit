````markdown
# PostgreSQL Setup for TRACKit Backend

This document provides instructions for setting up and running the TRACKit backend with PostgreSQL.

## 1. Prerequisites

### Install PostgreSQL (macOS)

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@16

# Start the PostgreSQL service
brew services start postgresql@16

# Add PostgreSQL binaries to your PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
# (Use /usr/local/opt/ instead of /opt/homebrew/ for Intel Macs)
```
````

### Install Required Node.js Packages

```bash
npm install pg pg-hstore
```

## 2. Database Setup

### Create Database and User

```bash
# Connect to PostgreSQL with your macOS username
psql postgres

# Create the database
CREATE DATABASE trackit_db;

# Create a dedicated user for the application
CREATE USER trackit_user WITH PASSWORD 'trackit_password';

# Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE trackit_db TO trackit_user;
ALTER DATABASE trackit_db OWNER TO trackit_user;

# Connect to the trackit_db
\c trackit_db

# Set up schema permissions
GRANT ALL ON SCHEMA public TO trackit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO trackit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO trackit_user;

# Exit PostgreSQL
\q
```

### Verify Connection

```bash
# Test connection with the new user
psql -U trackit_user -d trackit_db -W
# Enter the password when prompted:


# If successful, exit
\q
```

## 3. Project Configuration

### Environment Variables

Create or update .env file in the project root:

```
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FORCE_SYNC=true
DB_HOST=localhost
DB_USER=trackit_user
DB_PASSWORD=trackit_password
DB_NAME=trackit_db
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

Ensure db.config.js has PostgreSQL configuration:

```javascript
const path = require("path");

module.exports = {
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "trackit_user",
  password: process.env.DB_PASSWORD || "trackit_password",
  database: process.env.DB_NAME || "trackit_db",
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
```

## 4. Running the Application

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
npm start
```

The server should start on port 3001 (or the port specified in your .env file), and the database will be initialized with tables and demo data via `initState.js`.

## 5. Troubleshooting

### "role 'postgres' does not exist"

This means PostgreSQL was installed without a default postgres user. Use your macOS username instead, or create a postgres role:

```bash
psql postgres
CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'password';
\q
```

### "permission denied for schema public"

Your database user lacks permissions on the public schema:

```bash
psql postgres
GRANT ALL ON SCHEMA public TO trackit_user;
\q
```

### Connection Issues

If you're still having trouble connecting:

1. Verify PostgreSQL is running: `brew services list`
2. Restart PostgreSQL: `brew services restart postgresql@16`
3. Check your credentials in .env match those created for the database user

### Database Reset

If you need to reset the database:

```bash
psql postgres
DROP DATABASE trackit_db;
CREATE DATABASE trackit_db;
GRANT ALL PRIVILEGES ON DATABASE trackit_db TO trackit_user;
\q
```

Then restart your application with `FORCE_SYNC=true` in the .env file.
