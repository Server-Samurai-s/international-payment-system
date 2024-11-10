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

        if (!validateForm()) return;

        try {
            const response = await fetch('/user/login', {
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
            console.error('Login error:', error);
            setErrors({ password: 'An error occurred during login' });
        }
    };

    const handleLoginError = (status: number) => {
        if (status === 404) {
            setErrors({ identifier: 'Account number not found' });
        } else if (status === 401) {
            setErrors({ password: 'Incorrect password' });
        }
    };

    const handleLoginSuccess = (data: CustomerAuthResponse) => {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('isLoggedIn', 'true');
        onLoginSuccess();
        
        setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <input
                    type="text"
                    className={`form-control ${submitted && errors.identifier ? 'is-invalid' : ''}`}
                    value={form.identifier}
                    onChange={(e) => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder="Enter account number or Username"
                />
                {submitted && errors.identifier && (
                    <div className="custom-tooltip">{errors.identifier}</div>
                )}
            </div>

            <div className="form-group">
                <input
                    type="password"
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
                <p>Don't have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link></p>
            </div>
        </form>
    );
};

export default CustomerLogin; 