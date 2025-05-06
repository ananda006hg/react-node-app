import axios from 'axios';

const API_URL = 'http://localhost:5001/api/employees';

class EmployeeService {
  // Get all employees
  getAllEmployees() {
    return axios.get(API_URL);
  }

  // Get a single employee
  getEmployee(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  // Create a new employee
  createEmployee(employee) {
    return axios.post(API_URL, employee);
  }

  // Update an employee
  updateEmployee(id, employee) {
    return axios.patch(`${API_URL}/${id}`, employee);
  }

  // Delete an employee
  deleteEmployee(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

export default new EmployeeService();