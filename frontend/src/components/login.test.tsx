import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './login';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
    beforeEach(() => {
        render(
            <Router>
                <Login />
            </Router>
        );
    });

    test('renders login form elements', () => {
        expect(screen.getByText('Customer Login')).toBeInTheDocument();
        expect(screen.getByText('Employee Login')).toBeInTheDocument();
        expect(screen.getByLabelText(/Account Number/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
    });

    test('shows validation errors when form is empty', () => {
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));
        expect(screen.getByText(/Account number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    test('switches between customer and employee login', () => {
        const employeeButton = screen.getByText('Employee Login');
        fireEvent.click(employeeButton);
        expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();

        const customerButton = screen.getByText('Customer Login');
        fireEvent.click(customerButton);
        expect(screen.getByLabelText(/Account Number/i)).toBeInTheDocument();
    });
}); 