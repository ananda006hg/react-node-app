# Employee Management System

A full-stack application for managing employee details using React, Node.js, Express, and MongoDB.

## Project Structure

```
employee-management-system/
├── client/            # React frontend
└── server/            # Node.js & Express backend
    ├── models/        # MongoDB models
    ├── routes/        # Express routes
    ├── server.js      # Server entry point
    └── .env           # Environment variables
```

## Features

- View list of employees with details
- Add new employees
- Update existing employee information
- Delete employees
- Responsive design for all devices

## Technology Stack

### Frontend

- React.js
- React Bootstrap for UI components
- Axios for API communication
- React Icons for UI elements

### Backend

- Node.js with Express
- MongoDB with Mongoose
- CORS for cross-origin requests
- Dotenv for environment variables

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install server dependencies:
   ```
   cd server
   npm install
   ```
3. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the server:

   ```
   cd server
   npm run dev
   ```

2. Start the client:

   ```
   cd client
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## API Endpoints

- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get specific employee
- POST `/api/employees` - Create a new employee
- PATCH `/api/employees/:id` - Update an employee
- DELETE `/api/employees/:id` - Delete an employee
