const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const Employee = require('../models/employee.model');
const employeeRoutes = require('../routes/employee.routes');

// Mock data
const mockEmployees = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Developer',
    phone: '123-456-7890',
    department: 'Engineering'
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    position: 'Designer',
    phone: '987-654-3210',
    department: 'Design'
  }
];

// Setup Express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/employees', employeeRoutes);

// Mock Employee model
jest.mock('../models/employee.model');

describe('Employee Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET all employees tests
  describe('GET /api/employees', () => {
    it('should return all employees', async () => {
      // Mock the find method
      Employee.find.mockResolvedValue(mockEmployees);
      
      // Make the request
      const res = await request(app).get('/api/employees');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('John Doe');
      expect(res.body[1].name).toBe('Jane Smith');
      expect(Employee.find).toHaveBeenCalledTimes(1);
    });

    it('should handle error when getting all employees', async () => {
      // Mock the find method to throw an error
      const errorMessage = 'Database error';
      Employee.find.mockRejectedValue(new Error(errorMessage));
      
      // Make the request
      const res = await request(app).get('/api/employees');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(Employee.find).toHaveBeenCalledTimes(1);
    });
  });

  // GET single employee tests
  describe('GET /api/employees/:id', () => {
    it('should return a single employee by ID', async () => {
      const employee = mockEmployees[0];
      
      // Mock the findById method
      Employee.findById.mockResolvedValue(employee);
      
      // Make the request
      const res = await request(app).get(`/api/employees/${employee._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(employee.name);
      expect(res.body.email).toBe(employee.email);
      expect(Employee.findById).toHaveBeenCalledWith(employee._id.toString());
    });

    it('should return 404 when employee not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Mock the findById method to return null
      Employee.findById.mockResolvedValue(null);
      
      // Make the request
      const res = await request(app).get(`/api/employees/${nonExistentId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Employee not found');
      expect(Employee.findById).toHaveBeenCalledWith(nonExistentId.toString());
    });

    it('should handle error when getting a single employee', async () => {
      const invalidId = 'invalid-id';
      
      // Mock the findById method to throw an error
      Employee.findById.mockRejectedValue(new Error('Invalid ID'));
      
      // Make the request
      const res = await request(app).get(`/api/employees/${invalidId}`);
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(Employee.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  // POST new employee tests
  describe('POST /api/employees', () => {
    it('should create a new employee with valid data', async () => {
      const newEmployee = {
        name: 'New Employee',
        email: 'new@example.com',
        position: 'Manager',
        phone: '555-555-5555',
        department: 'Management'
      };
      
      const savedEmployee = {
        _id: new mongoose.Types.ObjectId(),
        ...newEmployee
      };

      // Mock the Employee constructor and save method
      Employee.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedEmployee)
      }));
      
      // Make the request
      const res = await request(app)
        .post('/api/employees')
        .send(newEmployee);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(newEmployee.name);
      expect(res.body.email).toBe(newEmployee.email);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteEmployee = {
        name: 'Incomplete',
        // Missing email and position
      };
      
      // Make the request
      const res = await request(app)
        .post('/api/employees')
        .send(incompleteEmployee);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('required fields');
    });

    it('should handle duplicate email error', async () => {
      const duplicateEmployee = {
        name: 'Duplicate Email',
        email: 'john@example.com', // Already exists
        position: 'Tester'
      };
      
      // Create an error with duplicate key code
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      
      // Mock the Employee constructor and save method to throw the error
      Employee.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(duplicateError)
      }));
      
      // Make the request
      const res = await request(app)
        .post('/api/employees')
        .send(duplicateEmployee);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Email already exists');
    });

    it('should handle other errors during employee creation', async () => {
      const validEmployee = {
        name: 'Valid Employee',
        email: 'valid@example.com',
        position: 'Tester'
      };
      
      // Mock the Employee constructor and save method to throw an error
      Employee.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));
      
      // Make the request
      const res = await request(app)
        .post('/api/employees')
        .send(validEmployee);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  // PATCH employee tests
  describe('PATCH /api/employees/:id', () => {
    it('should update an existing employee', async () => {
      const employeeId = mockEmployees[0]._id;
      const updateData = { name: 'Updated Name', position: 'Senior Developer' };
      
      // This is the object that findById will resolve with.
      // It needs a save method. The route handler will modify properties on this instance
      // *before* calling save.
      const mockFoundEmployee = {
        ...mockEmployees[0],
        // The save method will be called on this instance.
        save: jest.fn().mockImplementation(function() {
          // 'this' refers to mockFoundEmployee, which would have been updated by the route handler
          return Promise.resolve(this);
        })
      };

      // Mock the findById method to return our mockEmployee
      Employee.findById.mockResolvedValue(mockFoundEmployee);
      
      // Make the request
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send(updateData);
      
      expect(Employee.findById).toHaveBeenCalledWith(employeeId.toString());
      expect(mockFoundEmployee.name).toBe(updateData.name); // Verify route handler updated the instance
      expect(mockFoundEmployee.position).toBe(updateData.position);
      expect(mockFoundEmployee.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.position).toBe(updateData.position);
    });

    it('should return 404 when updating non-existent employee', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Name' };
      
      // Mock the findById method to return null
      Employee.findById.mockResolvedValue(null);
      
      // Make the request
      const res = await request(app)
        .patch(`/api/employees/${nonExistentId}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Employee not found');
      expect(Employee.findById).toHaveBeenCalledWith(nonExistentId.toString());
    });

    it('should handle error during employee update', async () => {
      const employeeId = mockEmployees[0]._id;
      const updateData = { name: 'Updated Name' };
      
      // Mock the findById method to throw an error
      Employee.findById.mockRejectedValue(new Error('Database error'));
      
      // Make the request
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(Employee.findById).toHaveBeenCalledWith(employeeId.toString());
    });
  });

  // DELETE employee tests
  describe('DELETE /api/employees/:id', () => {
    it('should delete an existing employee', async () => {
      const employeeId = mockEmployees[0]._id;
      
      // Mock the findById and findByIdAndDelete methods
      Employee.findById.mockResolvedValue(mockEmployees[0]);
      Employee.findByIdAndDelete.mockResolvedValue({});
      
      // Make the request
      const res = await request(app).delete(`/api/employees/${employeeId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Employee deleted successfully');
      expect(Employee.findById).toHaveBeenCalledWith(employeeId.toString());
      expect(Employee.findByIdAndDelete).toHaveBeenCalledWith(employeeId.toString());
    });

    it('should return 404 when deleting non-existent employee', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Mock the findById method to return null
      Employee.findById.mockResolvedValue(null);
      
      // Make the request
      const res = await request(app).delete(`/api/employees/${nonExistentId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Employee not found');
      expect(Employee.findById).toHaveBeenCalledWith(nonExistentId.toString());
      expect(Employee.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should handle error during employee deletion', async () => {
      const employeeId = mockEmployees[0]._id;
      
      // Mock the findById method to throw an error
      Employee.findById.mockRejectedValue(new Error('Database error'));
      
      // Make the request
      const res = await request(app).delete(`/api/employees/${employeeId}`);
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(Employee.findById).toHaveBeenCalledWith(employeeId.toString());
    });
  });
});
