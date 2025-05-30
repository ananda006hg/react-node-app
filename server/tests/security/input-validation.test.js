const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Employee = require('../../models/employee.model');
const employeeRoutes = require('../../routes/employee.routes');

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/employees', employeeRoutes);

// Mock Employee model
jest.mock('../../models/employee.model');

describe('Input Validation and Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for missing required fields
  test('should validate required fields during employee creation', async () => {
    // Test with missing name
    let response = await request(app)
      .post('/api/employees')
      .send({
        email: 'test@example.com',
        position: 'Developer'
        // name is missing
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('required fields');
    
    // Test with missing email
    response = await request(app)
      .post('/api/employees')
      .send({
        name: 'Test User',
        position: 'Developer'
        // email is missing
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('required fields');
    
    // Test with missing position
    response = await request(app)
      .post('/api/employees')
      .send({
        name: 'Test User',
        email: 'test@example.com'
        // position is missing
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('required fields');
  });

  // Test for email uniqueness enforcement
  test('should validate email uniqueness', async () => {
    // Mock the Employee constructor and save method to throw a duplicate key error
    const duplicateError = new Error('Duplicate key error');
    duplicateError.code = 11000;
    
    Employee.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(duplicateError)
    }));
    
    const response = await request(app)
      .post('/api/employees')
      .send({
        name: 'Test User',
        email: 'duplicate@example.com',
        position: 'Developer'
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Email already exists');
  });

  // Test for handling malformed input
  test('should handle malformed JSON input gracefully', async () => {
    // This test will directly hit Express's built-in error handler for invalid JSON
    const response = await request(app)
      .post('/api/employees')
      .set('Content-Type', 'application/json')
      .send('{"name": "Malformed JSON,}'); // Invalid JSON
    
    expect(response.statusCode).toBe(400);
  });

  // Test for handling overly large input
  test('should reject overly large input data', async () => {
    // Create a very large string (1MB)
    const largeString = 'a'.repeat(1024 * 1024);
    
    const response = await request(app)
      .post('/api/employees')
      .send({
        name: largeString,
        email: 'test@example.com',
        position: 'Developer'
      });
    
    // For this test to work properly, the server needs to have a body size limit configured
    // We'd typically expect a 413 Payload Too Large, but actual behavior depends on configuration
    expect(response.statusCode).not.toBe(201); // Should not succeed
  });

  // Test for handling SQL injection in MongoDB queries
  test('should return a server error for malformed ObjectIds resembling injection patterns', async () => {
    // Simulate Mongoose's CastError for an invalid ObjectId string
    // when a potentially malicious string is passed as an ID.
    const maliciousIdString = '{"$ne": null}';
    const castError = new Error(`Cast to ObjectId failed for value "${maliciousIdString}" (type string) at path "_id" for model "Employee"`);
    castError.name = 'CastError';
    castError.kind = 'ObjectId';
    castError.value = maliciousIdString;
    castError.path = '_id';

    Employee.findById.mockRejectedValue(castError);

    const response = await request(app).get(`/api/employees/${maliciousIdString}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toMatch(/Cast to ObjectId failed/i);
    expect(Employee.findById).toHaveBeenCalledWith(maliciousIdString);
  });

  // Test for XSS vulnerability protection
  test('should store and return data without executing scripts', async () => {
    // Create an employee with a script tag in the name
    const scriptInName = '<script>alert("XSS")</script>Test User';
    
    // Mock save to return the same data that was passed in
    Employee.mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: new mongoose.Types.ObjectId()
      })
    }));
    
    const response = await request(app)
      .post('/api/employees')
      .send({
        name: scriptInName,
        email: 'test@example.com',
        position: 'Developer'
      });
    
    expect(response.statusCode).toBe(201);
    
    // Verify that the script tag is stored as-is and not sanitized by our code
    // Frontend applications should handle sanitization when displaying this data
    expect(response.body.name).toBe(scriptInName);
  });
});
