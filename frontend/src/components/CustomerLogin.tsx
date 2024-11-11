import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomerAuthResponse } from '../types/auth';

interface CustomerFormState {
    identifier: string;
    password: string;
}

interface CustomerLoginProps {
    onLoginSuccess: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLoginSuccess }) => {
    const [form, setForm] = useState<CustomerFormState>({ identifier: '', password: '' });
    const [errors, setErrors] = useState<Partial<CustomerFormState>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: Partial<CustomerFormState> = {};
        let valid = true;

        if (!form.identifier.trim()) {
            newErrors.identifier = 'Account number is required';
            valid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://localhost:3001/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                handleLoginError(response.status);
                setLoading(false);
                return;
            }

            const data: CustomerAuthResponse = await response.json();
            handleLoginSuccess(data);
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ password: 'An unexpected error occurred. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (status: number) => {
        if (status === 404) {
            setErrors({ identifier: 'Account number not found' });
        } else if (status === 401) {
            setErrors({ password: 'Incorrect password' });
        } else {
            setErrors({ password: 'An unexpected error occurred. Please try again later.' });
        }
    };

    const handleLoginSuccess = (data: CustomerAuthResponse) => {
        sessionStorage.setItem('jwt', data.token);
        sessionStorage.setItem('firstName', data.firstName);
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('isLoggedIn', 'true');
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
                    onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
                    placeholder="Enter account number"
                    aria-describedby="identifierError"
                />
                {submitted && errors.identifier && (
                    <div id="identifierError" className="custom-tooltip" aria-live="polite">
                        {errors.identifier}
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    aria-describedby="passwordError"
                />
                {submitted && errors.password && (
                    <div id="passwordError" className="custom-tooltip" aria-live="polite">
                        {errors.password}
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="text-center mt-4">
                <p>
                    Don&apos;t have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link>
                </p>
            </div>
        </form>
    );
};

export default CustomerLogin;
