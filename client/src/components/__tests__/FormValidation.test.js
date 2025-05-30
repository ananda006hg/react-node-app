import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeList from '../EmployeeList';
import EmployeeService from '../../services/EmployeeService';

// Mock the EmployeeService
jest.mock('../../services/EmployeeService');

describe('Form Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getAllEmployees method
    EmployeeService.getAllEmployees.mockResolvedValue({
      data: []
    });
  });

  // Helper function to open the add employee modal
  const openAddEmployeeModal = () => {
    const addButton = screen.getByRole('button', { name: /Add New Employee/i });
    fireEvent.click(addButton);
  };

  test('should show validation error for missing required fields', async () => {
    render(<EmployeeList />);
    
    // Open the add employee modal
    openAddEmployeeModal();
    
    // Try to submit without filling any fields
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
    
    // Verify the API was not called
    expect(EmployeeService.createEmployee).not.toHaveBeenCalled();
  });

  test('should validate email format', async () => {
    render(<EmployeeList />);
    
    // Open the add employee modal
    openAddEmployeeModal();
    
    // Fill in only the name and position (required fields)
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Position \*/), { target: { value: 'Tester' } });
    
    // Add an invalid email
    fireEvent.change(screen.getByLabelText(/Email \*/), { target: { value: 'invalid-email' } });
    
    // Try to submit
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Email validation is done by the browser for input type="email"
    // Since we're using React Testing Library, we need to check that the form didn't submit
    expect(EmployeeService.createEmployee).not.toHaveBeenCalled();
  });

  test('should show success message when form is valid and submitted', async () => {
    // Mock API response for successful creation
    const newEmployee = {
      _id: '1',
      name: 'Valid User',
      email: 'valid@example.com',
      position: 'Valid Position'
    };
    EmployeeService.createEmployee.mockResolvedValue({
      data: newEmployee
    });
    
    render(<EmployeeList />);
    
    // Open the add employee modal
    openAddEmployeeModal();
    
    // Fill in all required fields with valid data
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: 'Valid User' } });
    fireEvent.change(screen.getByLabelText(/Email \*/), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText(/Position \*/), { target: { value: 'Valid Position' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Verify the API was called with the correct data
    await waitFor(() => {
      expect(EmployeeService.createEmployee).toHaveBeenCalledWith({
        name: 'Valid User',
        email: 'valid@example.com',
        position: 'Valid Position',
        phone: '',
        department: ''
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Employee added successfully')).toBeInTheDocument();
    });
  });

  test('should display API error messages when submission fails', async () => {
    // Mock API error response
    const errorMessage = 'Email already exists. Please use a different email address.';
    EmployeeService.createEmployee.mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    render(<EmployeeList />);
    
    // Open the add employee modal
    openAddEmployeeModal();
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'duplicate@example.com' } });
    fireEvent.change(screen.getByLabelText(/Position \*/i), { target: { value: 'Tester' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(`Error adding employee: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test('should cancel form submission when Cancel button is clicked', async () => {
    render(<EmployeeList />);
    
    // Open the add employee modal
    openAddEmployeeModal();
    
    // Fill in some data
    fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Canceled User' } });
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    // Verify the modal is closed
    expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
    
    // Verify no API call was made
    expect(EmployeeService.createEmployee).not.toHaveBeenCalled();
    
    // Open the modal again
    openAddEmployeeModal();
    
    // Check that the form was reset
    expect(screen.getByLabelText(/Name \*/i)).toHaveValue('');
  });
});
