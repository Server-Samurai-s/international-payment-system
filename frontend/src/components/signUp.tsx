import React, { useState, useEffect } from 'react'; // Import React hooks for managing state and side effects
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import '../styles/signUp.css'; // Import CSS for styling
import registerBackground from '../images/registerBackground.jpg'; // Import background image for the sign-up page

//--------------------------------------------------------------------------------------------------------//

// Interface for form state
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

//--------------------------------------------------------------------------------------------------------//

const SignUp: React.FC = () => {
    // State for the form fields
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

//--------------------------------------------------------------------------------------------------------//

    const [errors, setErrors] = useState<Partial<FormState>>({}); // State for managing validation errors
    const [submitted, setSubmitted] = useState(false); // Track if the form has been submitted
    const [passwordsMatch, setPasswordsMatch] = useState(true); // Track if passwords match
    const navigate = useNavigate(); // Hook for navigation

//------------------------------------------------------------------------------------------------

    // Check if passwords match when they change
    useEffect(() => {
        if (form.password !== form.confirmPassword) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    }, [form.password, form.confirmPassword]);

//------------------------------------------------------------------------------------------------

    // Update form field values and clear related errors
    function updateForm(value: Partial<FormState>, field: keyof FormState) {
        setForm((prev) => {
            const updatedForm = { ...prev, ...value };
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: '', // Clear the error for the updated field
            }));
            return updatedForm;
        });
    }

//--------------------------------------------------------------------------------------------------------//

    // Validate form inputs
    function validateForm(): boolean {
        const newErrors: Partial<FormState> = {};
        let valid = true;

//--------------------------------------------------------------------------------------------------------//

        // Regex for input validation
        const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
        const usernameRegex = /^[A-Za-z0-9_]+$/; // Letters, numbers, underscores
        const accountNumberRegex = /^\d{7,11}$/; // 7-11 digits
        const idNumberRegex = /^\d{13}$/; // Exactly 13 digits

        const minLength = form.password.length >= 8; // Check if the password has a minimum length of 8 characters
        const hasUppercase = /[A-Z]/.test(form.password); // Check if the password contains at least one uppercase letter
        const hasLowercase = /[a-z]/.test(form.password); // Check if the password contains at least one lowercase letter
        const hasNumber = /\d/.test(form.password); // Check if the password contains at least one numeric digit
        const hasSpecialChar = /[@$!%*?&]/.test(form.password); // Check if the password contains at least one special character

//--------------------------------------------------------------------------------------------------------//

        // Validate first and last names
        if (!nameRegex.test(form.firstName)) {
            newErrors.firstName = 'First Name must contain only letters';
            valid = false;
        }
        if (!nameRegex.test(form.lastName)) {
            newErrors.lastName = 'Last Name must contain only letters';
            valid = false;
        }

        // Validate email address
        if (!emailRegex.test(form.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address';
            valid = false;
        }

        // Validate username
        if (!usernameRegex.test(form.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
            valid = false;
        }

        // Validate password
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

        // Validate password confirmation
        if (!passwordsMatch) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        // Validate account number (7-11 digits)
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = 'Account Number must be between 7 and 11 digits';
            valid = false;
        }

        // Validate ID number (exactly 13 digits)
        if (!idNumberRegex.test(form.idNumber)) {
            newErrors.idNumber = 'ID Number must be exactly 13 digits';
            valid = false;
        }

        setErrors(newErrors); // Set validation errors
        return valid; // Return if the form is valid or not
    }

//--------------------------------------------------------------------------------------------------------//

    // Handle form submission
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true); // Mark the form as submitted

        if (validateForm()) {
            const newUser = { ...form }; // Copy form data

            try {
                // Send form data to the backend
                const response = await fetch('https://localhost:3001/user/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                // Reset form fields after successful sign-up
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
                setSubmitted(false); // Reset submission state
                navigate('/login'); // Redirect to login page after successful registration
            } catch (error) {
                window.alert(error); // Show error alert
            }
        }
    }

//--------------------------------------------------------------------------------------------------------//

    return (
        <div
            className="full-page-container"
            style={{
                backgroundImage: `url(${registerBackground})`, // Set background image for the page
            }}
        >
            <div className="form-container">
                <form onSubmit={onSubmit} noValidate> {/* Form with validation on submit */}
                    <h3>Customer Registration Form</h3>
                    <div className="row">
                        {/* First Name input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                className={submitted && errors.firstName ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="firstName"
                                value={form.firstName}
                                onChange={(e) => updateForm({ firstName: e.target.value }, 'firstName')} // Update form state on change
                                required
                            />
                            {submitted && errors.firstName && (
                                <div className="custom-tooltip">{errors.firstName}</div> // Display error if present
                            )}
                        </div>
                        {/* Last Name input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                className={submitted && errors.lastName ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="lastName"
                                value={form.lastName}
                                onChange={(e) => updateForm({ lastName: e.target.value }, 'lastName')} // Update form state on change
                                required
                            />
                            {submitted && errors.lastName && (
                                <div className="custom-tooltip">{errors.lastName}</div> // Display error if present
                            )}
                        </div>
                    </div>
                    <div className="row">
                        {/* Email Address input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="emailAddress">Email Address</label>
                            <input
                                type="email"
                                className={submitted && errors.emailAddress ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="emailAddress"
                                value={form.emailAddress}
                                onChange={(e) => updateForm({ emailAddress: e.target.value }, 'emailAddress')} // Update form state on change
                                required
                            />
                            {submitted && errors.emailAddress && (
                                <div className="custom-tooltip">{errors.emailAddress}</div> // Display error if present
                            )}
                        </div>
                        {/* Username input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className={submitted && errors.username ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="username"
                                value={form.username}
                                onChange={(e) => updateForm({ username: e.target.value }, 'username')} // Update form state on change
                                required
                            />
                            {submitted && errors.username && (
                                <div className="custom-tooltip">{errors.username}</div> // Display error if present
                            )}
                        </div>
                    </div>
                    <div className="row">
                        {/* Password input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className={submitted && errors.password ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="password"
                                value={form.password}
                                onChange={(e) => updateForm({ password: e.target.value }, 'password')} // Update form state on change
                                required
                            />
                            {submitted && errors.password && (
                                <div className="custom-tooltip">{errors.password}</div> // Display error if present
                            )}
                        </div>
                        {/* Confirm Password input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                className={submitted && (!passwordsMatch || errors.confirmPassword) ? 'is-invalid' : ''} // Add invalid class if passwords don't match or there's an error
                                id="confirmPassword"
                                value={form.confirmPassword}
                                onChange={(e) => updateForm({ confirmPassword: e.target.value }, 'confirmPassword')} // Update form state on change
                                required
                            />
                            {submitted && !passwordsMatch && (
                                <div className="custom-tooltip">Passwords do not match</div> // Display password mismatch error
                            )}
                            {submitted && errors.confirmPassword && (
                                <div className="custom-tooltip">{errors.confirmPassword}</div> // Display error if present
                            )}
                        </div>
                    </div>
                    <div className="row">
                        {/* Account Number input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="accountNumber">Account Number</label>
                            <input
                                type="text"
                                className={submitted && errors.accountNumber ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="accountNumber"
                                value={form.accountNumber}
                                onChange={(e) => updateForm({ accountNumber: e.target.value }, 'accountNumber')} // Update form state on change
                                maxLength={11} // Set max length for the account number
                                required
                            />
                            {submitted && errors.accountNumber && (
                                <div className="custom-tooltip">{errors.accountNumber}</div> // Display error if present
                            )}
                        </div>
                        {/* ID Number input field */}
                        <div className="col-md-6 mb-3 position-relative">
                            <label htmlFor="idNumber">ID Number</label>
                            <input
                                type="text"
                                className={submitted && errors.idNumber ? 'is-invalid' : ''} // Add invalid class if there's an error
                                id="idNumber"
                                value={form.idNumber}
                                onChange={(e) => updateForm({ idNumber: e.target.value }, 'idNumber')} // Update form state on change
                                maxLength={13} // Set max length for the ID number
                                required
                            />
                            {submitted && errors.idNumber && (
                                <div className="custom-tooltip">{errors.idNumber}</div> // Display error if present
                            )}
                        </div>
                    </div>
                    <button type="submit">Submit</button> {/* Submit button */}
                </form>
                <div className="text-center mt-4">
                    <p>An existing customer? <a href="/login">Click to Login</a></p> {/* Link to login page */}
                </div>
            </div>
        </div>
    );
};

//--------------------------------------------------------------------------------------------------------//

export default SignUp; // Export the SignUp component for use in other parts of the app

//------------------------------------------END OF FILE---------------------------------------------------//