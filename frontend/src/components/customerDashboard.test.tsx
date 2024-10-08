import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import CustomerDashboard from './customerDashboard';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => store[key] = value,
        clear: () => store = {},
        removeItem: (key: string) => delete store[key],
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CustomerDashboard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('redirects to login if no first name is found in localStorage', () => {
        const history = createMemoryHistory();
        render(
            <Router navigator={history} location={history.location}>
                <CustomerDashboard />
            </Router>
        );
        expect(history.location.pathname).toBe('/login');
    });

    test('displays the user\'s first name if found in localStorage', () => {
        localStorage.setItem('firstName', 'John');
        const history = createMemoryHistory();
        render(
            <Router navigator={history} location={history.location}>
                <CustomerDashboard />
            </Router>
        );
        expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    });

    test('fetches and displays transactions', async () => {
        localStorage.setItem('firstName', 'John');
        localStorage.setItem('jwt', 'fake-jwt-token');

        const mockTransactions = [
            {
                _id: '1',
                recipientName: 'Alice',
                recipientBank: 'Bank A',
                recipientAccountNo: '123456',
                amount: 100,
                transactionDate: '2023-01-01T00:00:00Z',
            },
            {
                _id: '2',
                recipientName: 'Bob',
                recipientBank: 'Bank B',
                recipientAccountNo: '654321',
                amount: 200,
                transactionDate: '2023-02-01T00:00:00Z',
            },
        ];

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockTransactions),
            })
        ) as jest.Mock;

        const history = createMemoryHistory();
        render(
            <Router navigator={history} location={history.location}>
                <CustomerDashboard />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });
    });

    test('navigates to payment page on "Make International Payment" button click', () => {
        localStorage.setItem('firstName', 'John');
        const history = createMemoryHistory();
        render(
            <Router navigator={history} location={history.location}>
                <CustomerDashboard />
            </Router>
        );

        const button = screen.getByText('Make International Payment');
        fireEvent.click(button);
        expect(history.location.pathname).toBe('/payment');
    });

    test('navigates to payment page with transaction data on "Pay again" button click', async () => {
        localStorage.setItem('firstName', 'John');
        localStorage.setItem('jwt', 'fake-jwt-token');

        const mockTransactions = [
            {
                _id: '1',
                recipientName: 'Alice',
                recipientBank: 'Bank A',
                recipientAccountNo: '123456',
                amount: 100,
                transactionDate: '2023-01-01T00:00:00Z',
            },
        ];

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockTransactions),
            })
        ) as jest.Mock;

        const history = createMemoryHistory();
        render(
            <Router navigator={history} location={history.location}>
                <CustomerDashboard />
            </Router>
        );

        await waitFor(() => {
            const payAgainButton = screen.getByText('Pay again');
            fireEvent.click(payAgainButton);
            expect(history.location.pathname).toBe('/payment');
            expect(history.location.state).toEqual(mockTransactions[0]);
        });
    });
});