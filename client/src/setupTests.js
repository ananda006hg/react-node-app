// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// This file is automatically run before each test file
// We can add global test configuration here

// Mock the window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console error messages during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Don't suppress React warnings
  if (typeof args[0] === 'string' && 
      args[0].includes('Warning:')) {
    originalConsoleError(...args);
  }

  // Suppress other console errors
  // This helps keep the test output clean
};

// Reset console.error after all tests are done
afterAll(() => {
  console.error = originalConsoleError;
});
