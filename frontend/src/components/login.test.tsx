import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './login';

describe('Login Component', () => {
    beforeEach(() => {
        render(
            <Router>
                <Login />
            </Router>
        );
    });

    test('renders login form', () => {
        expect(screen.getByPlaceholderText(/Enter account number/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
    });

    test('shows validation errors when form is submitted empty', async () => {
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Account number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
    });

    test('shows password length validation error', async () => {
        fireEvent.change(screen.getByPlaceholderText(/Enter account number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'short' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
        });
    });

    test('submits form with valid inputs', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'fake-token', firstName: 'John', userId: '123' }),
            })
        ) as jest.Mock;

        fireEvent.change(screen.getByPlaceholderText(/Enter account number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'validpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(localStorage.getItem('jwt')).toBe('fake-token');
            expect(localStorage.getItem('firstName')).toBe('John');
            expect(localStorage.getItem('userId')).toBe('123');
        });
    });

    test('shows error message for incorrect credentials', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
            })
        ) as jest.Mock;

        fireEvent.change(screen.getByPlaceholderText(/Enter account number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Incorrect password/i)).toBeInTheDocument();
        });
    });

    test('shows error message for non-existent user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            })
        ) as jest.Mock;

        fireEvent.change(screen.getByPlaceholderText(/Enter account number/i), { target: { value: 'nonexistentuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'somepassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Account number not found/i)).toBeInTheDocument();
        });
    });

    test('shows success message on successful login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'fake-token', firstName: 'John', userId: '123' }),
            })
        ) as jest.Mock;

        fireEvent.change(screen.getByPlaceholderText(/Enter account number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'validpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Login successful! Redirecting.../i)).toBeInTheDocument();
        });
    });
});