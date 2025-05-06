import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Form, Modal, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EmployeeService from '../services/EmployeeService';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
    name: '',
    email: '',
    position: '',
    phone: '',
    department: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch all employees
  const fetchEmployees = () => {
    console.log('Fetching employees...');
    EmployeeService.getAllEmployees()
      .then(response => {
        console.log('Employees fetched:', response.data);
        setEmployees(response.data);
      })
      .catch(error => {
        console.error('Error fetching employees', error);
        showAlert('Error fetching employee data', 'danger');
      });
  };

  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
    setCurrentEmployee({
      name: '',
      email: '',
      position: '',
      phone: '',
      department: ''
    });
    setIsEditing(false);
  };

  // Handle modal open for adding new employee
  const handleShow = () => {
    setShowModal(true);
    setIsEditing(false);
  };

  // Handle edit employee
  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee({ ...currentEmployee, [name]: value });
  };

  // Handle employee form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.position) {
      showAlert('Please fill in all required fields', 'danger');
      return;
    }

    if (isEditing) {
      EmployeeService.updateEmployee(currentEmployee._id, currentEmployee)
        .then((response) => {
          console.log('Update response:', response);
          fetchEmployees();
          handleClose();
          showAlert('Employee updated successfully', 'success');
        })
        .catch(error => {
          console.error('Error updating employee', error);
          showAlert(`Error updating employee: ${error.response?.data?.message || error.message}`, 'danger');
        });
    } else {
      console.log('Saving employee:', currentEmployee);
      EmployeeService.createEmployee(currentEmployee)
        .then((response) => {
          console.log('Create response:', response);
          fetchEmployees();
          handleClose();
          showAlert('Employee added successfully', 'success');
        })
        .catch(error => {
          console.error('Error adding employee:', error);
          showAlert(`Error adding employee: ${error.response?.data?.message || error.message}`, 'danger');
        });
    }
  };

  // Handle employee deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      EmployeeService.deleteEmployee(id)
        .then(() => {
          fetchEmployees();
          showAlert('Employee deleted successfully', 'success');
        })
        .catch(error => {
          console.error('Error deleting employee', error);
          showAlert('Error deleting employee', 'danger');
        });
    }
  };

  // Handle search filtering
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show alert message
  const showAlert = (message, variant) => {
    setAlert({
      show: true,
      message,
      variant
    });
    
    setTimeout(() => {
      setAlert({ show: false, message: '', variant: 'success' });
    }, 3000);
  };

  return (
    <Container className="mt-4">
      {/* Alert message */}
      {alert.show && (
        <Alert variant={alert.variant}>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={6}>
          <h2>Employee Management</h2>
        </Col>
        <Col md={3}>
          <Form.Control 
            type="text" 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3} className="text-right">
          <Button variant="primary" onClick={handleShow}>
            <FaPlus /> Add New Employee
          </Button>
        </Col>
      </Row>

      {/* Employee Table */}
      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => (
              <tr key={employee._id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.position}</td>
                <td>{employee.phone}</td>
                <td>{employee.department}</td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => handleEdit(employee)}
                  >
                    <FaEdit />
                  </Button>
                  {' '}
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(employee._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No employees found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Employee Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={currentEmployee.name} 
                onChange={handleInputChange}
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={currentEmployee.email} 
                onChange={handleInputChange}
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Position *</Form.Label>
              <Form.Control 
                type="text" 
                name="position"
                value={currentEmployee.position} 
                onChange={handleInputChange}
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control 
                type="text" 
                name="phone"
                value={currentEmployee.phone} 
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control 
                type="text" 
                name="department"
                value={currentEmployee.department} 
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeList;