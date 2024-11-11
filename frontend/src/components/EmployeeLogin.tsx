import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeAuthResponse } from '../types/auth';

interface EmployeeFormState {
    username: string;
    password: string;
}

interface EmployeeLoginProps {
    onLoginSuccess: () => void;
}

const EmployeeLogin: React.FC<EmployeeLoginProps> = ({ onLoginSuccess }) => {
    const [form, setForm] = useState<EmployeeFormState>({ username: '', password: '' });
    const [errors, setErrors] = useState<Partial<EmployeeFormState>>({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: Partial<EmployeeFormState> = {};
        let valid = true;

        if (!form.username.trim()) {
            newErrors.username = 'Username is required';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('https://localhost:3001/employee/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                handleLoginError(response.status);
                return;
            }

            handleLoginSuccess(data);
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ username: 'An error occurred during login' });
        }
    };

    const handleLoginError = (status: number) => {
        if (status === 404) {
            setErrors({ username: 'Username not found' });
        } else if (status === 401) {
            setErrors({ password: 'Incorrect password' });
        }
    };

    const handleLoginSuccess = (data: EmployeeAuthResponse) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('employeeData', JSON.stringify(data.employee));
        localStorage.setItem('isEmployee', 'true');
        localStorage.setItem('isLoggedIn', 'true');
        onLoginSuccess();
        
        setTimeout(() => {
            navigate('/employee-dashboard', { replace: true });
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <input
                    type="text"
                    className={`form-control ${submitted && errors.username ? 'is-invalid' : ''}`}
                    value={form.username}
                    onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username or account number"
                />
                {submitted && errors.username && (
                    <div className="custom-tooltip">{errors.username}</div>
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
        </form>
    );
};

export default EmployeeLogin; 