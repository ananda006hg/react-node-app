import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../../App';
import EmployeeService from '../../../services/EmployeeService';

// Mock the EmployeeService
jest.mock('../../../services/EmployeeService');

describe('Employee Management Integration Tests', () => {
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

  const newEmployee = {
    _id: '3',
    name: 'New Employee',
    email: 'new@example.com',
    position: 'Manager',
    phone: '555-555-5555',
    department: 'Management'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    EmployeeService.getAllEmployees.mockResolvedValue({
      data: mockEmployees
    });
    
    EmployeeService.createEmployee.mockResolvedValue({
      data: newEmployee
    });
    
    EmployeeService.updateEmployee.mockImplementation((id, data) => {
      const updatedEmployee = {
        ...mockEmployees.find(emp => emp._id === id),
        ...data
      };
      return Promise.resolve({ data: updatedEmployee });
    });
    
    EmployeeService.deleteEmployee.mockResolvedValue({
      data: { message: 'Employee deleted successfully' }
    });
  });

  // Test the full user flow of adding, viewing, editing, and deleting an employee
  test('full employee management flow', async () => {
    // Render the app
    render(<App />);
    
    // 1. Initial state - verify employees are loaded
    await waitFor(() => {
      expect(screen.getByText('Employee Management')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // 2. Add a new employee
    // Click the "Add New Employee" button
    fireEvent.click(screen.getByText(/Add New Employee/i));
    
    // Verify the modal appears
    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: newEmployee.name } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: newEmployee.email } });
    fireEvent.change(screen.getByLabelText('Position *'), { target: { value: newEmployee.position } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: newEmployee.phone } });
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: newEmployee.department } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    // Verify API was called
    await waitFor(() => {
      expect(EmployeeService.createEmployee).toHaveBeenCalledWith({
        name: newEmployee.name,
        email: newEmployee.email,
        position: newEmployee.position,
        phone: newEmployee.phone,
        department: newEmployee.department
      });
    });
    
    // Mock the getAllEmployees to now include the new employee
    EmployeeService.getAllEmployees.mockResolvedValue({
      data: [...mockEmployees, newEmployee]
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Employee added successfully')).toBeInTheDocument();
    });
    
    // Verify employee list was refreshed
    expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(2);
    
    // 3. Edit an employee
    // Mock the employee list to include the new employee
    await waitFor(() => {
      // Edit the first original employee (John Doe)
      fireEvent.click(screen.getByRole('button', { name: /edit John Doe/i }));
    });
    
    // Verify the edit modal appears
    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
      expect(screen.getByLabelText('Name *')).toHaveValue('John Doe');
    });
    
    // Update the position
    const updatedPosition = 'Senior Developer';
    fireEvent.change(screen.getByLabelText('Position *'), { target: { value: updatedPosition } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    
    // Verify API was called
    await waitFor(() => {
      expect(EmployeeService.updateEmployee).toHaveBeenCalledWith('1', {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        position: updatedPosition,
        phone: '123-456-7890',
        department: 'Engineering'
      });
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Employee updated successfully')).toBeInTheDocument();
    });
    
    // 4. Delete an employee
    // Mock the confirmation dialog
    window.confirm = jest.fn().mockImplementation(() => true);
    
    await waitFor(() => {
      // Delete the first original employee (John Doe)
      fireEvent.click(screen.getByRole('button', { name: /delete John Doe/i }));
    });
    
    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify API was called
    await waitFor(() => {
      expect(EmployeeService.deleteEmployee).toHaveBeenCalledWith('1');
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Employee deleted successfully')).toBeInTheDocument();
    });
    
    // 5. Search for an employee
    const searchInput = screen.getByPlaceholderText('Search employees...');
    fireEvent.change(searchInput, { target: { value: 'design' } });
    
    // Only the designer should be visible
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Clear search to show all employees
    fireEvent.change(searchInput, { target: { value: '' } });
  });
});
