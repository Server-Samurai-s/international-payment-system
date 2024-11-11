import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomerAuthResponse } from '../types/auth';

interface CustomerFormState {
    identifier: string;
    password: string;
    authError?: string;
    general?: string;
}

interface CustomerLoginProps {
    onLoginSuccess: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLoginSuccess }) => {
    const [form, setForm] = useState<CustomerFormState>({ identifier: '', password: '' });
    const [errors, setErrors] = useState<Partial<CustomerFormState>>({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: Partial<CustomerFormState> = {};
        let valid = true;

        if (!form.identifier.trim()) {
            newErrors.identifier = process.env.REACT_APP_ACCOUNT_REQUIRED_MESSAGE || 'Account number is required';
            valid = false;
        }

        if (!form.password) {
            newErrors.password = process.env.REACT_APP_PASSWORD_REQUIRED_MESSAGE || 'Password is required';
            valid = false;
        } else if (form.password.length < Number(process.env.REACT_APP_MIN_PASSWORD_LENGTH) || 8) {
            newErrors.password = `Password must be at least ${process.env.REACT_APP_MIN_PASSWORD_LENGTH || 8} characters`;
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateForm()) return;

        try {
            const response = await fetch('https://localhost:3001/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                handleLoginError(response.status);
                return;
            }

            const data: CustomerAuthResponse = await response.json();
            handleLoginSuccess(data);
        } catch (error) {
            const err = error as Error;
            console.error('Login error:', err.message);
            setErrors({ authError: 'An unexpected error occurred. Please try again later.' });
        }        
    };

    const handleLoginError = (status: number) => {
        if (status === 404) {
            setErrors({ general: 'Account number not found' });
        } else if (status === 401) {
            setErrors({ general: 'Incorrect credentials provided' });
        } else {
            setErrors({ general: 'An unexpected error occurred. Please try again later.' });
        }        
    };

    const handleLoginSuccess = (data: CustomerAuthResponse) => {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('isLoggedIn', 'true');
        onLoginSuccess();
        
        navigate('/dashboard', { replace: true });
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <label htmlFor="identifier">Account Number</label>
                <input
                    type="text"
                    id="identifier"
                    className={`form-control ${submitted && errors.identifier ? 'is-invalid' : ''}`}
                    value={form.identifier}
                    onChange={(e) => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder="Enter username or account number"
                />
                {submitted && errors.identifier && (
                    <div className="custom-tooltip">{errors.identifier}</div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                />
                {submitted && errors.password && (
                    <div className="custom-tooltip">{errors.password}</div>
                )}
            </div>

            <button type="submit" className="btn btn-primary">Log in</button>

            <div className="text-center mt-4">
                <p>Don&apos;t have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link></p>
            </div>
        </form>
    );
};

export default CustomerLogin;
