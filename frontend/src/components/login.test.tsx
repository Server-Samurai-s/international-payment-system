import React from 'react';
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
        expect(screen.getByText(/Login Form/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username or Account Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
    });

    test('shows validation errors when form is submitted empty', async () => {
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Username or Account Number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
    });

    test('shows password length validation error', async () => {
        fireEvent.change(screen.getByLabelText(/Username or Account Number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'short' } });
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

        fireEvent.change(screen.getByLabelText(/Username or Account Number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'validpassword' } });
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

        fireEvent.change(screen.getByLabelText(/Username or Account Number/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Incorrect password/i)).toBeInTheDocument();
        });
    });
});