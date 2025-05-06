# Getting Started with Employee Management System

This guide will help you run the Employee Management System application successfully.

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running

## Step 1: Start MongoDB

Before starting the application, ensure MongoDB is running:

```bash
# You can use the provided script
cd server
./start-mongodb.sh

# Or start MongoDB manually
mongod --dbpath ~/data/db
```

## Step 2: Test MongoDB Connection

To ensure MongoDB is running and accessible:

```bash
cd server
node test-db.js
```

If successful, you'll see: "Successfully connected to MongoDB"

## Step 3: Install Dependencies

If you haven't already installed the dependencies:

```bash
# Root level dependencies
npm install

# Client dependencies
cd client
npm install

# Server dependencies
cd ../server
npm install
```

## Step 4: Start the Application

You can start both the client and server concurrently:

```bash
# From the root directory
npm run dev
```

Or start them separately:

```bash
# Start the server
cd server
npm run dev

# In another terminal, start the client
cd client
npm start
```

## Step 5: Access the Application

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api/employees](http://localhost:5000/api/employees)

## API Endpoints

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get a specific employee
- `POST /api/employees` - Create a new employee
- `PATCH /api/employees/:id` - Update an employee
- `DELETE /api/employees/:id` - Delete an employee

## Troubleshooting

1. **MongoDB Connection Issues**

   - Ensure MongoDB is running
   - Check MongoDB connection URL in server/.env

2. **Port Conflicts**

   - If ports 3000 or 5000 are in use, modify them in:
     - Client port: Update the start script in client/package.json
     - Server port: Update the PORT variable in server/.env

3. **Other Issues**
   - Check console logs for both client and server
   - Verify all dependencies are properly installed
