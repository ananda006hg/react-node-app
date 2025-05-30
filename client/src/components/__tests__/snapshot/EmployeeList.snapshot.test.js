import React from 'react';
import { render } from '@testing-library/react';
import EmployeeList from '../../EmployeeList';
import EmployeeService from '../../../services/EmployeeService';

// Mock the EmployeeService
jest.mock('../../../services/EmployeeService');

describe('EmployeeList Snapshot Tests', () => {
  // Sample employee data
  const mockEmployees = [
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
  ];

  test('should match empty state snapshot', () => {
    // Mock API to return empty array
    EmployeeService.getAllEmployees.mockResolvedValue({ data: [] });
    
    const { asFragment } = render(<EmployeeList />);
    
    // Capture the initial render snapshot
    expect(asFragment()).toMatchSnapshot();
  });
  
  test('should match snapshot with employees', async () => {
    // Mock API to return employee data
    EmployeeService.getAllEmployees.mockResolvedValue({ data: mockEmployees });
    
    // Use RTL's async utilities to render with the resolved data
    const { asFragment, findByText } = render(<EmployeeList />);
    
    // Wait for an element that appears after data loads
    await findByText('John Doe');
    
    // Capture the loaded state snapshot
    expect(asFragment()).toMatchSnapshot();
  });
  
  test('should match modal snapshot when adding an employee', async () => {
    // Mock API
    EmployeeService.getAllEmployees.mockResolvedValue({ data: mockEmployees });
    
    // Render component
    const { asFragment, findByText, getByText } = render(<EmployeeList />);
    
    // Wait for component to load
    await findByText('John Doe');
    
    // Open the add employee modal
    getByText(/Add New Employee/i).click();
    
    // Capture snapshot with modal open
    expect(asFragment()).toMatchSnapshot();
  });
});
