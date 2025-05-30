const mongoose = require('mongoose');
const Employee = require('../models/employee.model');

// Connect to a test database before tests
beforeAll(async () => {
  const url = 'mongodb://localhost:27017/employee_management_test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clear the database after each test
afterEach(async () => {
  await Employee.deleteMany();
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Employee Model', () => {
  describe('Validation Tests', () => {
    it('should create a valid employee successfully', async () => {
      const validEmployee = {
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Developer',
        phone: '123-456-7890',
        department: 'Engineering'
      };
      
      const employee = new Employee(validEmployee);
      const savedEmployee = await employee.save();
      
      expect(savedEmployee._id).toBeDefined();
      expect(savedEmployee.name).toBe(validEmployee.name);
      expect(savedEmployee.email).toBe(validEmployee.email);
      expect(savedEmployee.position).toBe(validEmployee.position);
      expect(savedEmployee.phone).toBe(validEmployee.phone);
      expect(savedEmployee.department).toBe(validEmployee.department);
      expect(savedEmployee.joinDate).toBeDefined();
      expect(savedEmployee.createdAt).toBeDefined();
      expect(savedEmployee.updatedAt).toBeDefined();
    });
    
    it('should fail validation without required fields', async () => {
      const invalidEmployee = {
        phone: '123-456-7890',
        department: 'Engineering'
      };

      try {
        const employee = new Employee(invalidEmployee);
        await employee.save();
        // If we reach this point, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('ValidationError');
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.position).toBeDefined();
      }
    });

    it('should enforce email uniqueness', async () => {
      // Create first employee with email
      const employee1 = new Employee({
        name: 'John Doe',
        email: 'duplicate@example.com',
        position: 'Developer'
      });
      
      await employee1.save();
      
      // Try to create another employee with the same email
      const employee2 = new Employee({
        name: 'Jane Doe',
        email: 'duplicate@example.com', // Same email
        position: 'Manager'
      });
      
      try {
        await employee2.save();
        // If we reach this point, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.code).toBe(11000); // MongoDB duplicate key error code
      }
    });
  });

  describe('Default Value Tests', () => {
    it('should set default join date to current date', async () => {
      const employeeWithoutJoinDate = {
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Developer'
      };
      
      const now = Date.now();
      const employee = new Employee(employeeWithoutJoinDate);
      const savedEmployee = await employee.save();
      
      // Check if joinDate is close to current time (within 5 seconds)
      const joinDateTimestamp = savedEmployee.joinDate.getTime();
      expect(joinDateTimestamp).toBeGreaterThanOrEqual(now - 5000);
      expect(joinDateTimestamp).toBeLessThanOrEqual(now + 5000);
    });
  });

  describe('Query Tests', () => {
    beforeEach(async () => {
      // Insert test data
      await Employee.create([
        {
          name: 'John Doe',
          email: 'john@example.com',
          position: 'Developer',
          department: 'Engineering'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          position: 'Designer',
          department: 'Design'
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          position: 'Manager',
          department: 'Engineering'
        }
      ]);
    });
    
    it('should find employees by department', async () => {
      const engineers = await Employee.find({ department: 'Engineering' });
      
      expect(engineers).toHaveLength(2);
      expect(engineers[0].name).toBe('John Doe');
      expect(engineers[1].name).toBe('Bob Johnson');
    });
    
    it('should find an employee by email', async () => {
      const employee = await Employee.findOne({ email: 'jane@example.com' });
      
      expect(employee).toBeDefined();
      expect(employee.name).toBe('Jane Smith');
      expect(employee.position).toBe('Designer');
    });
    
    it('should update an employee\'s position', async () => {
      // Find the employee
      const employee = await Employee.findOne({ email: 'john@example.com' });
      
      // Update the position
      employee.position = 'Senior Developer';
      await employee.save();
      
      // Retrieve updated employee
      const updatedEmployee = await Employee.findOne({ email: 'john@example.com' });
      
      expect(updatedEmployee.position).toBe('Senior Developer');
    });
    
    it('should delete an employee by ID', async () => {
      // Find the employee to delete
      const employee = await Employee.findOne({ email: 'bob@example.com' });
      
      // Delete the employee
      await Employee.findByIdAndDelete(employee._id);
      
      // Try to find the deleted employee
      const deletedEmployee = await Employee.findOne({ email: 'bob@example.com' });
      
      expect(deletedEmployee).toBeNull();
      
      // Check remaining count
      const count = await Employee.countDocuments();
      expect(count).toBe(2);
    });
  });
});
