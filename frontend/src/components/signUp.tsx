import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signUp.css'; // Import CSS file
import registerBackground from '../images/registerBackground.jpg'; // Import background image

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
        if (form.password !== form.confirmPassword) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    }, [form.password, form.confirmPassword]);

    function updateForm(value: Partial<FormState>, field: keyof FormState) {
        setForm((prev) => {
            const updatedForm = { ...prev, ...value };
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: '',
            }));
            return updatedForm;
        });
    }

    function validateForm(): boolean {
        const newErrors: Partial<FormState> = {};
        let valid = true;

        // Regex for input validation (whitelisting)
        const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
        const usernameRegex = /^[A-Za-z0-9_]+$/; // Letters, numbers, underscores
        const accountNumberRegex = /^\d{7,11}$/; // 7-11 digits
        const idNumberRegex = /^\d{13}$/; // Exactly 13 digits

        const minLength = form.password.length >= 8;
        const hasUppercase = /[A-Z]/.test(form.password);
        const hasLowercase = /[a-z]/.test(form.password);
        const hasNumber = /\d/.test(form.password);
        const hasSpecialChar = /[@$!%*?&]/.test(form.password);

        // First Name and Last Name validation
        if (!nameRegex.test(form.firstName)) {
            newErrors.firstName = 'First Name must contain only letters';
            valid = false;
        }
        if (!nameRegex.test(form.lastName)) {
            newErrors.lastName = 'Last Name must contain only letters';
            valid = false;
        }

        // Email validation
        if (!emailRegex.test(form.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address';
            valid = false;
        }

        // Username validation
        if (!usernameRegex.test(form.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
            valid = false;
        }

        // Password Validation
        if (!minLength) {
            newErrors.password = 'Password must be at least 8 characters long';
            valid = false;
        } else if (!hasUppercase) {
            newErrors.password = 'Password must contain at least one uppercase letter';
            valid = false;
        } else if (!hasLowercase) {
            newErrors.password = 'Password must contain at least one lowercase letter';
            valid = false;
        } else if (!hasNumber) {
            newErrors.password = 'Password must contain at least one number';
            valid = false;
        } else if (!hasSpecialChar) {
            newErrors.password = 'Password must contain at least one special character';
            valid = false;
        }

        if (!passwordsMatch) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        // Account Number validation (numeric and length between 7 and 11)
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = 'Account Number must be between 7 and 11 digits';
            valid = false;
        }

        // ID Number validation (numeric and exactly 13 digits)
        if (!idNumberRegex.test(form.idNumber)) {
            newErrors.idNumber = 'ID Number must be exactly 13 digits';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true);

        if (validateForm()) {
            const newUser = { ...form };

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/user/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                // Reset form after successful sign-up
                setForm({
                    firstName: '',
                    lastName: '',
                    emailAddress: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    accountNumber: '',
                    idNumber: '',
                });
                setSubmitted(false);
                navigate('/login');
            } catch (error) {
                window.alert(error);
            }
        }
    }

    return (
        <div
            className="full-page-container"
            style={{
                backgroundImage: `url(${registerBackground})`,
            }}
        >
            <div className="form-container">
                <form onSubmit={onSubmit} noValidate>
                    <h3>Customer Registration Form</h3>
                    <div className="row">
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                className={submitted && errors.firstName ? 'is-invalid' : ''}
                                id="firstName"
                                value={form.firstName}
                                onChange={(e) => updateForm({ firstName: e.target.value }, 'firstName')}
                                required
                            />
                            {submitted && errors.firstName && (
                                <div className="custom-tooltip">{errors.firstName}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                className={submitted && errors.lastName ? 'is-invalid' : ''}
                                id="lastName"
                                value={form.lastName}
                                onChange={(e) => updateForm({ lastName: e.target.value }, 'lastName')}
                                required
                            />
                            {submitted && errors.lastName && (
                                <div className="custom-tooltip">{errors.lastName}</div>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="emailAddress">Email Address</label>
                            <input
                                type="email"
                                className={submitted && errors.emailAddress ? 'is-invalid' : ''}
                                id="emailAddress"
                                value={form.emailAddress}
                                onChange={(e) => updateForm({ emailAddress: e.target.value }, 'emailAddress')}
                                required
                            />
                            {submitted && errors.emailAddress && (
                                <div className="custom-tooltip">{errors.emailAddress}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className={submitted && errors.username ? 'is-invalid' : ''}
                                id="username"
                                value={form.username}
                                onChange={(e) => updateForm({ username: e.target.value }, 'username')}
                                required
                            />
                            {submitted && errors.username && (
                                <div className="custom-tooltip">{errors.username}</div>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className={submitted && errors.password ? 'is-invalid' : ''}
                                id="password"
                                value={form.password}
                                onChange={(e) => updateForm({ password: e.target.value }, 'password')}
                                required
                            />
                            {submitted && errors.password && (
                                <div className="custom-tooltip">{errors.password}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                className={submitted && (!passwordsMatch || errors.confirmPassword) ? 'is-invalid' : ''}
                                id="confirmPassword"
                                value={form.confirmPassword}
                                onChange={(e) => updateForm({ confirmPassword: e.target.value }, 'confirmPassword')}
                                required
                            />
                            {submitted && !passwordsMatch && (
                                <div className="custom-tooltip">Passwords do not match</div>
                            )}
                            {submitted && errors.confirmPassword && (
                                <div className="custom-tooltip">{errors.confirmPassword}</div>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="accountNumber">Account Number</label>
                            <input
                                type="text"
                                className={submitted && errors.accountNumber ? 'is-invalid' : ''}
                                id="accountNumber"
                                value={form.accountNumber}
                                onChange={(e) => updateForm({ accountNumber: e.target.value }, 'accountNumber')}
                                maxLength={11}
                                required
                            />
                            {submitted && errors.accountNumber && (
                                <div className="custom-tooltip">{errors.accountNumber}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="idNumber">ID Number</label>
                            <input
                                type="text"
                                className={submitted && errors.idNumber ? 'is-invalid' : ''}
                                id="idNumber"
                                value={form.idNumber}
                                onChange={(e) => updateForm({ idNumber: e.target.value }, 'idNumber')}
                                maxLength={13}
                                required
                            />
                            {submitted && errors.idNumber && (
                                <div className="custom-tooltip">{errors.idNumber}</div>
                            )}
                        </div>
                    </div>
                    <button type="submit">Submit</button>
                </form>
                <div className="text-center mt-4">
                    <p>An existing customer? <a href="/login">Click to Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
