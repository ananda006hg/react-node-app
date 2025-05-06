const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.model');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  console.log('POST request received:', req.body);
  
  // Validate required fields
  if (!req.body.name || !req.body.email || !req.body.position) {
    return res.status(400).json({ 
      message: 'Missing required fields. Name, email, and position are required.' 
    });
  }
  
  const employee = new Employee({
    name: req.body.name,
    email: req.body.email,
    position: req.body.position,
    phone: req.body.phone || '',
    department: req.body.department || ''
  });

  try {
    const newEmployee = await employee.save();
    console.log('Employee created successfully:', newEmployee);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error saving employee:', error.message);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists. Please use a different email address.' 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Update an employee
router.patch('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.body.name) employee.name = req.body.name;
    if (req.body.email) employee.email = req.body.email;
    if (req.body.position) employee.position = req.body.position;
    if (req.body.phone) employee.phone = req.body.phone;
    if (req.body.department) employee.department = req.body.department;

    const updatedEmployee = await employee.save();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;