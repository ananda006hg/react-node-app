import axios from 'axios';
import EmployeeService from '../EmployeeService';

// Mock axios
jest.mock('axios');

describe('EmployeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Sample data
  const mockEmployee = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Developer',
    department: 'Engineering'
  };
  
  const mockEmployeesList = [
    mockEmployee,
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: 'Designer',
      department: 'Design'
    }
  ];

  test('getAllEmployees should fetch all employees', async () => {
    // Mock the axios get request
    axios.get.mockResolvedValue({ data: mockEmployeesList });
    
    // Call the service method
    const result = await EmployeeService.getAllEmployees();
    
    // Assert that axios was called with correct URL
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/employees');
    
    // Assert the returned data
    expect(result.data).toEqual(mockEmployeesList);
  });
  
  test('getEmployee should fetch a single employee by ID', async () => {
    // Mock the axios get request
    axios.get.mockResolvedValue({ data: mockEmployee });
    
    // Call the service method
    const result = await EmployeeService.getEmployee('1');
    
    // Assert that axios was called with correct URL
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/api/employees/1');
    
    // Assert the returned data
    expect(result.data).toEqual(mockEmployee);
  });
  
  test('createEmployee should post new employee data', async () => {
    // Employee data without ID (as it would be for creation)
    const newEmployee = {
      name: 'New Employee',
      email: 'new@example.com',
      position: 'Manager',
      department: 'Management'
    };
    
    const createdEmployee = { ...newEmployee, _id: '3' };
    
    // Mock the axios post request
    axios.post.mockResolvedValue({ data: createdEmployee });
    
    // Call the service method
    const result = await EmployeeService.createEmployee(newEmployee);
    
    // Assert that axios was called with correct URL and data
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5001/api/employees',
      newEmployee
    );
    
    // Assert the returned data
    expect(result.data).toEqual(createdEmployee);
  });
  
  test('updateEmployee should patch employee data', async () => {
    // Update data
    const updateData = {
      name: 'Updated Name',
      position: 'Senior Developer'
    };
    
    const updatedEmployee = { ...mockEmployee, ...updateData };
    
    // Mock the axios patch request
    axios.patch.mockResolvedValue({ data: updatedEmployee });
    
    // Call the service method
    const result = await EmployeeService.updateEmployee('1', updateData);
    
    // Assert that axios was called with correct URL and data
    expect(axios.patch).toHaveBeenCalledWith(
      'http://localhost:5001/api/employees/1',
      updateData
    );
    
    // Assert the returned data
    expect(result.data).toEqual(updatedEmployee);
  });
  
  test('deleteEmployee should delete an employee by ID', async () => {
    // Mock response for successful deletion
    const deleteResponse = { message: 'Employee deleted successfully' };
    
    // Mock the axios delete request
    axios.delete.mockResolvedValue({ data: deleteResponse });
    
    // Call the service method
    const result = await EmployeeService.deleteEmployee('1');
    
    // Assert that axios was called with correct URL
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:5001/api/employees/1');
    
    // Assert the returned data
    expect(result.data).toEqual(deleteResponse);
  });
  
  test('service methods should handle errors', async () => {
    // Mock error response
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue(new Error(errorMessage));
    
    // Test getAllEmployees error handling
    await expect(EmployeeService.getAllEmployees()).rejects.toThrow(errorMessage);
    
    // Test getEmployee error handling
    await expect(EmployeeService.getEmployee('1')).rejects.toThrow(errorMessage);
    
    // Setup for other methods
    axios.post.mockRejectedValue(new Error(errorMessage));
    axios.patch.mockRejectedValue(new Error(errorMessage));
    axios.delete.mockRejectedValue(new Error(errorMessage));
    
    // Test createEmployee error handling
    await expect(EmployeeService.createEmployee({})).rejects.toThrow(errorMessage);
    
    // Test updateEmployee error handling
    await expect(EmployeeService.updateEmployee('1', {})).rejects.toThrow(errorMessage);
    
    // Test deleteEmployee error handling
    await expect(EmployeeService.deleteEmployee('1')).rejects.toThrow(errorMessage);
  });
});
