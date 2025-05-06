import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import EmployeeList from './components/EmployeeList';
import { Container, Navbar } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Employee Management System</Navbar.Brand>
        </Container>
      </Navbar>
      <EmployeeList />
    </div>
  );
}

export default App;
