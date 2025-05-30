const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const employeeRoutes = require('../../routes/employee.routes');
const Employee = require('../../models/employee.model');

// This test file is for performance testing of the API
// It's designed to assess how the API handles multiple concurrent requests

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/employees', employeeRoutes);

// Test database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_perf_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to performance test database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Disconnect from test database
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from performance test database');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};

// Skip these tests in regular test runs as they can be slow
// Run these tests specifically when performance testing is needed
describe.skip('API Performance Tests', () => {
  beforeAll(async () => {
    await connectDB();
    
    // Setup test data - create multiple employees
    await Employee.deleteMany({});
    
    // Create 100 test employees
    const employees = [];
    for (let i = 0; i < 100; i++) {
      employees.push({
        name: `Test User ${i}`,
        email: `user${i}@example.com`,
        position: `Position ${i % 5}`,
        department: `Department ${i % 10}`,
        phone: `555-${i.toString().padStart(3, '0')}-${(i * 7).toString().padStart(4, '0')}`
      });
    }
    
    await Employee.insertMany(employees);
  }, 30000); // Extended timeout for setup
  
  afterAll(async () => {
    await Employee.deleteMany({});
    await disconnectDB();
  });
  
  // Test GET all employees performance
  test('GET /api/employees - performance with large dataset', async () => {
    const start = Date.now();
    
    const response = await request(app).get('/api/employees');
    
    const end = Date.now();
    const duration = end - start;
    
    console.log(`GET all employees took ${duration}ms`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(100);
    expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
  }, 10000); // Extended timeout
  
  // Test concurrent API calls
  test('Multiple concurrent API calls', async () => {
    const start = Date.now();
    
    // Make 10 concurrent API calls
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(request(app).get('/api/employees'));
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    
    const end = Date.now();
    const duration = end - start;
    
    console.log(`10 concurrent GET requests took ${duration}ms`);
    
    // Verify all responses
    responses.forEach(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(100);
    });
    
    // Average time should be reasonable
    expect(duration / 10).toBeLessThan(1000); // Average response time < 1 second
  }, 20000); // Extended timeout
  
  // Test creating multiple employees
  test('Creating multiple employees in sequence', async () => {
    const start = Date.now();
    
    // Create 10 employees in sequence
    for (let i = 0; i < 10; i++) {
      const employee = {
        name: `Performance Test User ${i}`,
        email: `perf${i}@example.com`,
        position: 'Tester',
        department: 'QA',
        phone: `555-123-${i.toString().padStart(4, '0')}`
      };
      
      const response = await request(app)
        .post('/api/employees')
        .send(employee);
      
      expect(response.statusCode).toBe(201);
    }
    
    const end = Date.now();
    const duration = end - start;
    
    console.log(`Creating 10 employees took ${duration}ms`);
    
    // Average time should be reasonable
    expect(duration / 10).toBeLessThan(500); // Average creation time < 500ms
  }, 30000); // Extended timeout
  
  // Test API under load with rapid sequential requests
  test('API under load with rapid sequential requests', async () => {
    // Get all employees first to cache them
    await request(app).get('/api/employees');
    
    const start = Date.now();
    
    // Make 50 sequential requests
    for (let i = 0; i < 50; i++) {
      const response = await request(app).get('/api/employees');
      expect(response.statusCode).toBe(200);
    }
    
    const end = Date.now();
    const duration = end - start;
    
    console.log(`50 sequential GET requests took ${duration}ms (${duration/50}ms avg)`);
    
    // Average time should be reasonable
    expect(duration / 50).toBeLessThan(100); // Average response time < 100ms
  }, 60000); // Extended timeout
});
