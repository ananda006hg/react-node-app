import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/re    // Click the Add New Employee button
    const addButton = screen.getByRole('button', { name: /Add New Employee/i });
    fireEvent.click(addButton);
    
    // Check if the modal is displayed
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    expect(screen.queryByText('Edit Employee')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Name \*/)).toBeInTheDocument();port userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EmployeeList from '../EmployeeList';
import EmployeeService from '../../services/EmployeeService';

// Mock the EmployeeService
jest.mock('../../services/EmployeeService');

// Mock window.confirm
window.confirm = jest.fn();

describe('EmployeeList Component', () => {
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

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock the getAllEmployees method to return our sample data
    EmployeeService.getAllEmployees.mockResolvedValue({
      data: mockEmployees
    });
  });

  // Test that employees load and display correctly
  test('should load and display employees', async () => {
    render(<EmployeeList />);
    
    // Check initial state
    expect(screen.getByText('Employee Management')).toBeInTheDocument();
    
    // Wait for employees to load
    await waitFor(() => {
      expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(1);
    });
    
    // Check if employees are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });
  
  // Test empty state
  test('should display "No employees found" when no employees are present', async () => {
    // Mock empty employee list
    EmployeeService.getAllEmployees.mockResolvedValue({ data: [] });
    
    render(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });
  });
  
  // Test search functionality
  test('should filter employees when searching', async () => {
    render(<EmployeeList />);
    
    // Wait for employees to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search employees...');
    fireEvent.change(searchInput, { target: { value: 'design' } });
    
    // Check that only matching employees are displayed
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
  
  // Test add employee modal
  test('should open add employee modal when Add New Employee button is clicked', async () => {
    render(<EmployeeList />);
    
    // Click the Add New Employee button
    const addButton = screen.getByRole('button', { name: /Add New Employee/i });
    fireEvent.click(addButton);
    
    // Check if the modal is displayed
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    expect(screen.queryByText('Edit Employee')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Name \*/)).toBeInTheDocument();
  });
  
  // Test create employee
  test('should create a new employee when form is submitted', async () => {
    const newEmployee = {
      _id: '3',
      name: 'New Employee',
      email: 'new@example.com',
      position: 'Manager',
      phone: '555-555-5555',
      department: 'Management'
    };
    
    // Mock the createEmployee method
    EmployeeService.createEmployee.mockResolvedValue({
      data: newEmployee
    });
    
    render(<EmployeeList />);
    
    // Open the add employee modal
    const addButton = screen.getByRole('button', { name: /Add New Employee/i });
    fireEvent.click(addButton);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: newEmployee.name } });
    fireEvent.change(screen.getByLabelText(/Email \*/), { target: { value: newEmployee.email } });
    fireEvent.change(screen.getByLabelText(/Position \*/), { target: { value: newEmployee.position } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: newEmployee.phone } });
    fireEvent.change(screen.getByLabelText(/Department/), { target: { value: newEmployee.department } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Verify the service was called with the correct data
    await waitFor(() => {
      expect(EmployeeService.createEmployee).toHaveBeenCalledWith({
        name: newEmployee.name,
        email: newEmployee.email,
        position: newEmployee.position,
        phone: newEmployee.phone,
        department: newEmployee.department
      });
    });
    
    // Verify the list was refreshed
    await waitFor(() => {
      expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(2);
    });
  });
  
  // Test edit employee
  test('should open edit modal with employee data when edit button is clicked', async () => {
    render(<EmployeeList />);
    
    // Wait for employees to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first edit button
    fireEvent.click(screen.getByRole('button', { name: `Edit ${mockEmployees[0].name}` }));
    
    // Check if the edit modal is displayed with the correct employee data
    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name \*/)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/Email \*/)).toHaveValue('john@example.com');
    });
  });
  
  // Test update employee
  test('should update an employee when edit form is submitted', async () => {
    const updatedEmployee = {
      ...mockEmployees[0],
      name: 'Updated Name',
      position: 'Senior Developer'
    };
    
    // Mock the updateEmployee method
    EmployeeService.updateEmployee.mockResolvedValue({
      data: updatedEmployee
    });
    
    render(<EmployeeList />);
    
    // Wait for employees to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first edit button
    fireEvent.click(screen.getByRole('button', { name: `Edit ${mockEmployees[0].name}` }));
    
    // Wait for the modal to open
    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    });
    
    // Update the form fields
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: 'Updated Name' } });
    fireEvent.change(screen.getByLabelText(/Position \*/), { target: { value: 'Senior Developer' } });
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateButton);
    
    // Verify the service was called with the correct data
    await waitFor(() => {
      expect(EmployeeService.updateEmployee).toHaveBeenCalledWith('1', {
        _id: '1',
        name: 'Updated Name',
        email: 'john@example.com',
        position: 'Senior Developer',
        phone: '123-456-7890',
        department: 'Engineering'
      });
    });
    
    // Verify the list was refreshed
    await waitFor(() => {
      expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(2);
    });
  });
  
  // Test delete employee
  test('should delete an employee when delete button is clicked and confirmed', async () => {
    // Mock the delete confirmation
    window.confirm.mockReturnValue(true);
    
    // Mock the deleteEmployee method
    EmployeeService.deleteEmployee.mockResolvedValue({});
    
    render(<EmployeeList />);
    
    // Wait for employees to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first delete button
    fireEvent.click(screen.getByRole('button', { name: `Delete ${mockEmployees[0].name}` }));
    
    // Verify the confirmation was shown
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify the service was called with the correct ID
    await waitFor(() => {
      expect(EmployeeService.deleteEmployee).toHaveBeenCalledWith('1');
    });
    
    // Verify the list was refreshed
    await waitFor(() => {
      expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(2);
    });
  });
  
  // Test cancel delete
  test('should not delete an employee when delete is canceled', async () => {
    // Mock the delete confirmation to return false (cancel)
    window.confirm.mockReturnValue(false);
    
    render(<EmployeeList />);
    
    // Wait for employees to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first delete button
    fireEvent.click(screen.getByRole('button', { name: `Delete ${mockEmployees[0].name}` }));
    
    // Verify the confirmation was shown
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify the service was NOT called
    expect(EmployeeService.deleteEmployee).not.toHaveBeenCalled();
    
    // Verify the list was NOT refreshed
    expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(1); // Only initial load
  });
  
  // Test validation errors
  test('should show error when required fields are missing on submit', async () => {
    render(<EmployeeList />);
    
    // Open the add employee modal
    const addButton = screen.getByRole('button', { name: /Add New Employee/i });
    fireEvent.click(addButton);
    
    // Submit without filling required fields
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    // Check for error alert
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
    
    // Verify the service was NOT called
    expect(EmployeeService.createEmployee).not.toHaveBeenCalled();
  });
  
  // Test API error handling
  test('should show error alert when API call fails', async () => {
    // Mock API error
    EmployeeService.getAllEmployees.mockRejectedValue(new Error('API error'));
    
    render(<EmployeeList />);
    
    // Check for error alert
    await waitFor(() => {
      expect(screen.getByText('Error fetching employee data')).toBeInTheDocument();
    });
  });

  // Test modal closing
  test('should close modal when Cancel button is clicked', async () => {
    render(<EmployeeList />);
    
    // Open the add employee modal
    const addButton = screen.getByText(/Add New Employee/i);
    fireEvent.click(addButton);
    
    // Verify modal is open
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
    });
  });
});
