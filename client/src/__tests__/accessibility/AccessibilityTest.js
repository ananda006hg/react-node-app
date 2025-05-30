import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../App';
import EmployeeList from '../../components/EmployeeList';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the EmployeeService
jest.mock('../../services/EmployeeService', () => ({
  getAllEmployees: jest.fn().mockResolvedValue({
    data: [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Developer',
        phone: '123-456-7890',
        department: 'Engineering'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        position: 'Designer',
        phone: '987-654-3210',
        department: 'Design'
      }
    ]
  })
}));

describe('Accessibility Tests', () => {
  // Please note: To run these tests, you need to install jest-axe package:
  // npm install --save-dev jest-axe
  
  test('App component should have no accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('EmployeeList component should have no accessibility violations', async () => {
    const { container, findByText } = render(<EmployeeList />);
    
    // Wait for content to load
    await findByText('John Doe');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Note: These tests require jest-axe package to be installed
  // If you're seeing failures with these tests, you might need to:
  // 1. Install jest-axe: npm install --save-dev jest-axe
  // 2. Address any actual accessibility issues in your components
});
