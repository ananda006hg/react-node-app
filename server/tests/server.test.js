const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// Mock the imported modules
jest.mock('mongoose');
jest.mock('cors', () => jest.fn(() => jest.fn()));
jest.mock('../routes/employee.routes', () => {
  const router = express.Router();
  router.get('/', (req, res) => res.status(200).json([{ name: 'Test Employee' }]));
  return router;
});
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Server', () => {
  let app;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset modules to get a fresh instance of the app
    jest.resetModules();
    
    // Mock the mongoose connection
    mongoose.connect.mockResolvedValue();
    
    // Import the app
    app = require('../server');
  });
  
  afterEach(async () => {
    if (app.close) {
      await new Promise(resolve => app.close(resolve));
    }
  });
  
  it('should connect to MongoDB', () => {
    expect(mongoose.connect).toHaveBeenCalled();
  });
  
  it('should use CORS middleware', () => {
    expect(cors).toHaveBeenCalled();
  });
  
  it('should handle employee routes', async () => {
    const response = await request(app).get('/api/employees');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Test Employee' })
    ]));
  });
  
  it('should handle errors', async () => {
    // Create a route that triggers an error
    app._router.stack.push({
      route: {
        path: '/test-error',
        stack: [{
          method: 'get',
          handle: (req, res, next) => {
            const err = new Error('Test error');
            next(err);
          }
        }]
      }
    });
    
    const response = await request(app).get('/test-error');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Something went wrong on the server');
  });
  
  it('should include error details in development mode', async () => {
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';
    
    // Reset modules to get a fresh instance with the new environment
    jest.resetModules();
    app = require('../server');
    
    // Create a route that triggers an error
    app._router.stack.push({
      route: {
        path: '/dev-error',
        stack: [{
          method: 'get',
          handle: (req, res, next) => {
            const err = new Error('Development error details');
            next(err);
          }
        }]
      }
    });
    
    const response = await request(app).get('/dev-error');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Development error details');
    
    // Reset NODE_ENV
    delete process.env.NODE_ENV;
  });
});
