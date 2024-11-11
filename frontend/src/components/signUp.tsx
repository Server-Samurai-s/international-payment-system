import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import '../styles/signUp.css';
import SuccessMessage from './successMessage';

interface FormState {
    firstName: string;
    lastName: string;
    emailAddress: string;
    username: string;
    password: string;
    confirmPassword: string;
    accountNumber: string;
    idNumber: string;
}

const SignUp: React.FC = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [form, setForm] = useState<FormState>({
        firstName: '',
        lastName: '',
        emailAddress: '',
        username: '',
        password: '',
        confirmPassword: '',
        accountNumber: '',
        idNumber: '',
    });

    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [submitted, setSubmitted] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setPasswordsMatch(form.password === form.confirmPassword);
    }, [form.password, form.confirmPassword]);

    const updateForm = (value: Partial<FormState>, field: keyof FormState) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: '',
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormState> = {};
        let valid = true;

        const nameRegex = /^[A-Za-z\s]+$/;
        const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,6}$/;
        const usernameRegex = /^[A-Za-z0-9_]+$/;
        const accountNumberRegex = /^\d{7,11}$/;
        const idNumberRegex = /^\d{13}$/;

        const minLength = form.password.length >= 8;
        const hasUppercase = /[A-Z]/.test(form.password);
        const hasLowercase = /[a-z]/.test(form.password);
        const hasNumber = /\d/.test(form.password);
        const hasSpecialChar = /[@$!%*?&]/.test(form.password);

        if (!nameRegex.test(form.firstName)) {
            newErrors.firstName = 'First Name must contain only letters';
            valid = false;
        }
        if (!nameRegex.test(form.lastName)) {
            newErrors.lastName = 'Last Name must contain only letters';
            valid = false;
        }
        if (!emailRegex.test(form.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address';
            valid = false;
        }
        if (!usernameRegex.test(form.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
            valid = false;
        }
        if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
            newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';
            valid = false;
        }
        if (!passwordsMatch) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = 'Account Number must be between 7 and 11 digits';
            valid = false;
        }
        if (!idNumberRegex.test(form.idNumber)) {
            newErrors.idNumber = 'ID Number must be exactly 13 digits';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (validateForm()) {
            try {
                const response = await fetch('https://localhost:3001/user/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                if (!response.ok) throw new Error(`Error: ${response.statusText}`);

                setForm({
                    firstName: '', lastName: '', emailAddress: '', username: '', password: '', confirmPassword: '', accountNumber: '', idNumber: '',
                });
                setSubmitted(false);
                setShowSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } catch (error) {
                window.alert(error);
            }
        }
    };

    return (
        <div className="sign-up-page">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="form-container">
                <form onSubmit={onSubmit} noValidate>
                    <h3>Customer Registration Form</h3>
                    <div className="row">
                        <div className="col">
                            <input
                                type="text"
                                className={`form-control ${submitted && errors.firstName ? 'is-invalid' : ''}`}
                                value={form.firstName}
                                onChange={(e) => updateForm({ firstName: e.target.value }, 'firstName')}
                                placeholder="First Name"
                            />
                            {submitted && errors.firstName && <div className="error-message">{errors.firstName}</div>}
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className={`form-control ${submitted && errors.lastName ? 'is-invalid' : ''}`}
                                value={form.lastName}
                                onChange={(e) => updateForm({ lastName: e.target.value }, 'lastName')}
                                placeholder="Last Name"
                            />
                            {submitted && errors.lastName && <div className="error-message">{errors.lastName}</div>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <input
                                type="email"
                                className={`form-control ${submitted && errors.emailAddress ? 'is-invalid' : ''}`}
                                value={form.emailAddress}
                                onChange={(e) => updateForm({ emailAddress: e.target.value }, 'emailAddress')}
                                placeholder="Email Address"
                            />
                            {submitted && errors.emailAddress && <div className="error-message">{errors.emailAddress}</div>}
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className={`form-control ${submitted && errors.username ? 'is-invalid' : ''}`}
                                value={form.username}
                                onChange={(e) => updateForm({ username: e.target.value }, 'username')}
                                placeholder="Username"
                            />
                            {submitted && errors.username && <div className="error-message">{errors.username}</div>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <input
                                type="password"
                                className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`}
                                value={form.password}
                                onChange={(e) => updateForm({ password: e.target.value }, 'password')}
                                placeholder="Password"
                            />
                            {submitted && errors.password && <div className="error-message">{errors.password}</div>}
                        </div>
                        <div className="col">
                            <input
                                type="password"
                                className={`form-control ${submitted && (!passwordsMatch || errors.confirmPassword) ? 'is-invalid' : ''}`}
                                value={form.confirmPassword}
                                onChange={(e) => updateForm({ confirmPassword: e.target.value }, 'confirmPassword')}
                                placeholder="Confirm Password"
                            />
                            {submitted && !passwordsMatch && <div className="error-message">Passwords do not match</div>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <input
                                type="text"
                                className={`form-control ${submitted && errors.accountNumber ? 'is-invalid' : ''}`}
                                value={form.accountNumber}
                                onChange={(e) => updateForm({ accountNumber: e.target.value }, 'accountNumber')}
                                placeholder="Account Number"
                                maxLength={11}
                            />
                            {submitted && errors.accountNumber && <div className="error-message">{errors.accountNumber}</div>}
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className={`form-control ${submitted && errors.idNumber ? 'is-invalid' : ''}`}
                                value={form.idNumber}
                                onChange={(e) => updateForm({ idNumber: e.target.value }, 'idNumber')}
                                placeholder="ID Number"
                                maxLength={13}
                            />
                            {submitted && errors.idNumber && <div className="error-message">{errors.idNumber}</div>}
                        </div>
                    </div>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
                <div className="login-link">
                    <p>An existing customer? <a href="/login">Click to Login</a></p>
                </div>
            </div>
            {showSuccess && <SuccessMessage message="Account created successfully! Redirecting to login..." />}
        </div>
    );
};

export default SignUp;
