/**
 * Mock implementation of the EmployeeService for testing
 * This can be used in tests to avoid real API calls
 */

class MockEmployeeService {
  constructor() {
    this.employees = [];
    this.nextId = 1;
  }

  // Reset the mock data
  reset() {
    this.employees = [];
    this.nextId = 1;
  }

  // Set initial data
  setEmployees(employees) {
    this.employees = [...employees];
    
    // Find the highest ID to set nextId properly
    if (employees.length > 0) {
      const maxId = Math.max(...employees.map(emp => 
        typeof emp._id === 'string' ? parseInt(emp._id) : emp._id));
      this.nextId = maxId + 1;
    }
  }

  // Get all employees
  getAllEmployees() {
    return Promise.resolve({ data: this.employees });
  }

  // Get a single employee
  getEmployee(id) {
    const employee = this.employees.find(emp => emp._id == id);
    
    if (employee) {
      return Promise.resolve({ data: employee });
    } else {
      return Promise.reject({ 
        response: { 
          status: 404, 
          data: { message: 'Employee not found' } 
        } 
      });
    }
  }

  // Create a new employee
  createEmployee(employee) {
    // Check for duplicate email
    if (this.employees.some(emp => emp.email === employee.email)) {
      return Promise.reject({ 
        response: { 
          status: 400, 
          data: { message: 'Email already exists. Please use a different email address.' } 
        } 
      });
    }
    
    // Create new employee with ID
    const newEmployee = {
      ...employee,
      _id: this.nextId.toString()
    };
    
    this.nextId++;
    this.employees.push(newEmployee);
    
    return Promise.resolve({ data: newEmployee });
  }

  // Update an employee
  updateEmployee(id, employee) {
    const index = this.employees.findIndex(emp => emp._id == id);
    
    if (index === -1) {
      return Promise.reject({ 
        response: { 
          status: 404, 
          data: { message: 'Employee not found' } 
        } 
      });
    }
    
    // Check for duplicate email if email is being updated
    if (employee.email && 
        employee.email !== this.employees[index].email && 
        this.employees.some(emp => emp.email === employee.email)) {
      return Promise.reject({ 
        response: { 
          status: 400, 
          data: { message: 'Email already exists. Please use a different email address.' } 
        } 
      });
    }
    
    // Update employee
    const updatedEmployee = {
      ...this.employees[index],
      ...employee
    };
    
    this.employees[index] = updatedEmployee;
    
    return Promise.resolve({ data: updatedEmployee });
  }

  // Delete an employee
  deleteEmployee(id) {
    const index = this.employees.findIndex(emp => emp._id == id);
    
    if (index === -1) {
      return Promise.reject({ 
        response: { 
          status: 404, 
          data: { message: 'Employee not found' } 
        } 
      });
    }
    
    this.employees.splice(index, 1);
    
    return Promise.resolve({ 
      data: { message: 'Employee deleted successfully' } 
    });
  }
}

export default new MockEmployeeService();
