import MockEmployeeService from './MockEmployeeService';

describe('MockEmployeeService', () => {
  // Reset the mock before each test
  beforeEach(() => {
    MockEmployeeService.reset();
  });
  
  // Sample data
  const sampleEmployees = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', position: 'Developer' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', position: 'Designer' }
  ];
  
  test('should set and get employees correctly', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Get all employees
    const result = await MockEmployeeService.getAllEmployees();
    
    expect(result.data).toEqual(sampleEmployees);
    expect(result.data.length).toBe(2);
  });
  
  test('should get a single employee by ID', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Get employee by ID
    const result = await MockEmployeeService.getEmployee('1');
    
    expect(result.data).toEqual(sampleEmployees[0]);
  });
  
  test('should handle employee not found', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Try to get non-existent employee
    await expect(MockEmployeeService.getEmployee('999')).rejects.toMatchObject({
      response: {
        status: 404,
        data: { message: 'Employee not found' }
      }
    });
  });
  
  test('should create a new employee', async () => {
    // Create a new employee
    const newEmployee = {
      name: 'New User',
      email: 'new@example.com',
      position: 'Manager'
    };
    
    const result = await MockEmployeeService.createEmployee(newEmployee);
    
    // Check the created employee
    expect(result.data._id).toBe('1');
    expect(result.data.name).toBe(newEmployee.name);
    expect(result.data.email).toBe(newEmployee.email);
    
    // Check that the employee was added to the list
    const allEmployees = await MockEmployeeService.getAllEmployees();
    expect(allEmployees.data.length).toBe(1);
    expect(allEmployees.data[0]).toEqual(result.data);
  });
  
  test('should handle duplicate email during creation', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Try to create an employee with an existing email
    const duplicateEmployee = {
      name: 'Duplicate User',
      email: 'john@example.com', // Same as existing employee
      position: 'Manager'
    };
    
    await expect(MockEmployeeService.createEmployee(duplicateEmployee)).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: expect.stringContaining('Email already exists') }
      }
    });
  });
  
  test('should update an existing employee', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Update an employee
    const updatedData = {
      name: 'John Updated',
      position: 'Senior Developer'
    };
    
    const result = await MockEmployeeService.updateEmployee('1', updatedData);
    
    // Check the updated employee
    expect(result.data._id).toBe('1');
    expect(result.data.name).toBe(updatedData.name);
    expect(result.data.position).toBe(updatedData.position);
    expect(result.data.email).toBe(sampleEmployees[0].email); // Unchanged field
    
    // Check that the employee was updated in the list
    const updatedEmployee = (await MockEmployeeService.getEmployee('1')).data;
    expect(updatedEmployee.name).toBe(updatedData.name);
    expect(updatedEmployee.position).toBe(updatedData.position);
  });
  
  test('should delete an employee', async () => {
    // Set initial data
    MockEmployeeService.setEmployees(sampleEmployees);
    
    // Delete an employee
    const result = await MockEmployeeService.deleteEmployee('1');
    
    // Check the response
    expect(result.data.message).toContain('deleted successfully');
    
    // Check that the employee was removed from the list
    const allEmployees = await MockEmployeeService.getAllEmployees();
    expect(allEmployees.data.length).toBe(1);
    expect(allEmployees.data[0]._id).toBe('2');
    
    // Try to get the deleted employee
    await expect(MockEmployeeService.getEmployee('1')).rejects.toMatchObject({
      response: {
        status: 404
      }
    });
  });
});
