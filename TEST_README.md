# Running Tests for the Employee Management System

This document provides instructions for running the comprehensive test suites for both the client and server components of the Employee Management System.

## Prerequisites

Before running tests, ensure you have:

1. Node.js installed
2. MongoDB installed and running (required for integration tests)
3. All dependencies installed:

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

## Server Tests

The server tests include unit tests, integration tests, and security tests.

### Running Server Tests

```bash
cd server
npm test
```

This will run all server tests in watch mode. To run them once:

```bash
npm run test:ci
```

### Server Test Categories

1. **Unit Tests**:

   - `employee.model.test.js`: Tests the Employee Mongoose model validation and methods
   - `employee.routes.test.js`: Tests the API route handlers with mocked models
   - `server.test.js`: Tests the Express server setup and middleware

2. **Integration Tests**:

   - `integration/api.test.js`: End-to-end tests for the API using a test database

3. **Security Tests**:
   - `security/input-validation.test.js`: Tests input validation, error handling, and protection against common vulnerabilities

## Client Tests

The client tests include unit tests for components, services, and utility functions, as well as integration tests.

### Running Client Tests

```bash
cd client
npm test
```

This will run all client tests in watch mode. To run them once with coverage:

```bash
npm test -- --watchAll=false --coverage
```

### Client Test Categories

1. **Component Tests**:

   - `components/__tests__/EmployeeList.test.js`: Tests the main EmployeeList component
   - `components/__tests__/FormValidation.test.js`: Tests form validation behavior

2. **Service Tests**:

   - `services/__tests__/EmployeeService.test.js`: Tests the API service layer

3. **Utility Tests**:

   - `utils/__tests__/validation.test.js`: Tests utility validation functions

4. **Integration Tests**:

   - `components/__tests__/integration/EmployeeManagement.test.js`: Tests the entire employee management flow

5. **App Tests**:
   - `__tests__/App.test.js`: Tests the main App component

## Test Coverage

To generate and view test coverage reports:

### Server Coverage

```bash
cd server
npm test -- --coverage
```

View the coverage report at `server/coverage/lcov-report/index.html`

### Client Coverage

```bash
cd client
npm test -- --coverage
```

View the coverage report at `client/coverage/lcov-report/index.html`

## Continuous Integration

For CI/CD pipelines, use these commands:

```bash
# Server tests
cd server
npm run test:ci

# Client tests
cd client
npm test -- --watchAll=false
```

## Best Practices for Adding Tests

When adding new features, follow these testing guidelines:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test how components work together
3. **Test Coverage**: Aim for at least 80% test coverage
4. **Edge Cases**: Always test for edge cases and error conditions
5. **Mocking**: Use mocks for external services and APIs

## Common Testing Issues

1. **MongoDB Connection Errors**: Ensure MongoDB is running for integration tests
2. **Mock Resets**: Use `jest.clearAllMocks()` in `beforeEach` blocks
3. **Async Test Failures**: Use `await waitFor()` for async UI updates
4. **Test Isolation**: Avoid test interdependencies by cleaning up after each test
