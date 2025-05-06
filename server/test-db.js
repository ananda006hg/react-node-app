const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

mongoose.connect('mongodb://localhost:27017/employee_management')
  .then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });