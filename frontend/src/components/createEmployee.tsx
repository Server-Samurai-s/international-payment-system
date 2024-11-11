import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EmployeeRole } from '../types/employee';
import '../styles/createEmployee.css';

interface EmployeeFormState {
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: EmployeeRole;
}

const CreateEmployee: React.FC = () => {
    const [form, setForm] = useState<EmployeeFormState>({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: EmployeeRole.AGENT
    });
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

        if (!form.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            valid = false;
        }

        if (!form.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            valid = false;
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await fetch('/employee/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    role: form.role
                })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    setErrors({ username: 'Username already exists' });
                    return;
                }
                throw new Error('Failed to create employee');
            }

            navigate('/employee-dashboard');
        } catch (error) {
            console.error('Error creating employee:', error);
            setErrors({ username: 'An error occurred while creating the employee' });
        }
    };

    return (
        <div className="full-page-container">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="create-employee-container">
                <h3 className="create-employee__title">Create New Employee</h3>
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <input
                            type="text"
                            className={`form-control ${submitted && errors.username ? 'is-invalid' : ''}`}
                            value={form.username}
                            onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Username"
                        />
                        {submitted && errors.username && (
                            <div className="custom-tooltip">{errors.username}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            className={`form-control ${submitted && errors.firstName ? 'is-invalid' : ''}`}
                            value={form.firstName}
                            onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First Name"
                        />
                        {submitted && errors.firstName && (
                            <div className="custom-tooltip">{errors.firstName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            className={`form-control ${submitted && errors.lastName ? 'is-invalid' : ''}`}
                            value={form.lastName}
                            onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last Name"
                        />
                        {submitted && errors.lastName && (
                            <div className="custom-tooltip">{errors.lastName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <select
                            className="form-control"
                            value={form.role}
                            onChange={(e) => setForm(prev => ({ 
                                ...prev, 
                                role: e.target.value as EmployeeRole 
                            }))}
                        >
                            <option value={EmployeeRole.AGENT}>Agent</option>
                            <option value={EmployeeRole.MANAGER}>Manager</option>
                            <option value={EmployeeRole.SUPER_ADMIN}>Super Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`}
                            value={form.password}
                            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Password"
                        />
                        {submitted && errors.password && (
                            <div className="custom-tooltip">{errors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            className={`form-control ${submitted && errors.confirmPassword ? 'is-invalid' : ''}`}
                            value={form.confirmPassword}
                            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm Password"
                        />
                        {submitted && errors.confirmPassword && (
                            <div className="custom-tooltip">{errors.confirmPassword}</div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Create Employee</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/employee-dashboard')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;
