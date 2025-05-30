const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const employeeRoutes = require('../../routes/employee.routes');
const Employee = require('../../models/employee.model');

// Setup test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/employees', employeeRoutes);

// Test database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Disconnect from test database
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};

describe('API Integration Tests', () => {
  let employeeId;

  beforeAll(async () => {
    await connectDB();
    // Clear the database
    await Employee.deleteMany({});
  });

  afterAll(async () => {
    await Employee.deleteMany({});
    await disconnectDB();
  });

  // Test create employee
  test('POST /api/employees - create a new employee', async () => {
    const newEmployee = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      position: 'Tester',
      phone: '555-123-4567',
      department: 'QA'
    };

    const response = await request(app)
      .post('/api/employees')
      .send(newEmployee);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe(newEmployee.name);
    expect(response.body.email).toBe(newEmployee.email);

    // Save employee ID for later tests
    employeeId = response.body._id;
  });

  // Test get all employees
  test('GET /api/employees - get all employees', async () => {
    const response = await request(app).get('/api/employees');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name', 'Integration Test User');
  });

  // Test get employee by ID
  test('GET /api/employees/:id - get employee by ID', async () => {
    const response = await request(app).get(`/api/employees/${employeeId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', employeeId);
    expect(response.body).toHaveProperty('name', 'Integration Test User');
    expect(response.body).toHaveProperty('email', 'integration@test.com');
  });

  // Test get employee with invalid ID
  test('GET /api/employees/:id - get employee with invalid ID', async () => {
    const response = await request(app).get('/api/employees/invalidid');

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('message');
  });

  // Test update employee
  test('PATCH /api/employees/:id - update employee', async () => {
    const updateData = {
      position: 'Senior Tester',
      department: 'Quality Assurance'
    };

    const response = await request(app)
      .patch(`/api/employees/${employeeId}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', employeeId);
    expect(response.body).toHaveProperty('position', updateData.position);
    expect(response.body).toHaveProperty('department', updateData.department);
    // Verify unchanged fields remain
    expect(response.body).toHaveProperty('name', 'Integration Test User');
    expect(response.body).toHaveProperty('email', 'integration@test.com');
  });

  // Test create employee with duplicate email
  test('POST /api/employees - create employee with duplicate email', async () => {
    const duplicateEmployee = {
      name: 'Duplicate User',
      email: 'integration@test.com', // Same email as existing employee
      position: 'Developer'
    };

    const response = await request(app)
      .post('/api/employees')
      .send(duplicateEmployee);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Email already exists');
  });

  // Test delete employee
  test('DELETE /api/employees/:id - delete employee', async () => {
    const response = await request(app).delete(`/api/employees/${employeeId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Employee deleted successfully');

    // Verify employee is deleted
    const getResponse = await request(app).get(`/api/employees/${employeeId}`);
    expect(getResponse.statusCode).toBe(404);
  });
});
