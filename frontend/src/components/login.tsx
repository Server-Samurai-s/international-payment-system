import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import '../styles/login.css';
import SuccessMessage from './successMessage';
import fetch from 'node-fetch';

interface FormState {
    identifier: string;
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        identifier: '',
        password: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);



    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const updateForm = (value: Partial<FormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [Object.keys(value)[0]]: '',
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormState> = {};
        let valid = true;

        if (!form.identifier.trim()) {
            newErrors.identifier = 'Username or Account Number is required';
            valid = false;
        }

        if (!form.password.trim()) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateForm()) return;

        const userCredentials = { ...form };

        try {
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ identifier: 'Username or Account Number not found' });
                } else if (response.status === 401) {
                    setErrors({ password: 'Incorrect password' });
                }
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            const { token, firstName, userId } = data as { token: string, firstName: string, userId: string };

            localStorage.setItem("jwt", token);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("userId", userId);

            setShowSuccess(true);
            
            setForm({ identifier: '', password: '' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            window.alert(error);
        }
    };

    return (
        <div className="full-page-container">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="login-form-container">
                <h3>Login Form</h3>
                <form onSubmit={onSubmit} noValidate>
                    <div className="form-group">
                        <input
                            type="text"
                            className={`form-control ${submitted && errors.identifier ? 'is-invalid' : ''}`}
                            id="identifier"
                            value={form.identifier}
                            onChange={(e) => updateForm({ identifier: e.target.value })}
                            placeholder="Enter username or account number"
                        />
                        {submitted && errors.identifier && (
                            <div className="custom-tooltip">{errors.identifier}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`}
                            id="password"
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                            placeholder="Enter password"
                        />
                        {submitted && errors.password && (
                            <div className="custom-tooltip">{errors.password}</div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Log in
                    </button>
                </form>

                {/* <div className="text-center mt-4">
                    <Link to="/forgot-password" className="btn btn-outline-info">
                        Forgot Password?
                    </Link>
                </div> */}

                <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link></p>
                </div>
            </div>
            {showSuccess && <SuccessMessage message="Login successful! Redirecting..." />}
        </div>
    );
};

export default Login;