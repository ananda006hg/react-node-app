import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the EmployeeList component to avoid testing its implementation
jest.mock('../components/EmployeeList', () => () => <div data-testid="mock-employee-list">Employee List Component</div>);

describe('App Component', () => {
  test('renders navbar with correct title', () => {
    render(<App />);
    const navbarTitle = screen.getByText('Employee Management System');
    expect(navbarTitle).toBeInTheDocument();
  });
  
  test('renders the EmployeeList component', () => {
    render(<App />);
    const employeeListComponent = screen.getByTestId('mock-employee-list');
    expect(employeeListComponent).toBeInTheDocument();
  });
  
  test('has the app wrapper with appropriate className', () => {
    render(<App />);
    const appDiv = screen.getByText(/Employee Management System/i).closest('.App');
    expect(appDiv).toBeInTheDocument();
  });
  
  test('navbar has dark background', () => {
    render(<App />);
    const navbar = screen.getByText(/Employee Management System/i).closest('.navbar');
    expect(navbar).toHaveClass('bg-dark');
    expect(navbar).toHaveClass('navbar-dark');
  });
});
