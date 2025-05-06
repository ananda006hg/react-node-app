const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Simpler CORS configuration
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const employeeRoutes = require('./routes/employee.routes');
app.use('/api/employees', employeeRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server Setup
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});