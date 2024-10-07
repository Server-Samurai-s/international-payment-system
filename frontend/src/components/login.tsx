import React, { useState } from 'react'; // Import React and useState for state management
import { useNavigate, Link } from 'react-router-dom'; // Import navigation and Link from React Router
import '../styles/login.css'; // Import CSS for login styling
import registerBackground from '../images/registerBackground.jpg'; // Import background image for the login page

//--------------------------------------------------------------------------------------------------------//

// Interface for form state
interface FormState {
    identifier: string; // Username or Account Number
    password: string; // Password
}

//--------------------------------------------------------------------------------------------------------//

const Login: React.FC = () => {
    // State for the form inputs (identifier and password)
    const [form, setForm] = useState<FormState>({
        identifier: '',
        password: '',
    });

//--------------------------------------------------------------------------------------------------------//

    // State for storing validation errors
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [submitted, setSubmitted] = useState(false);// State to track form submission
    const navigate = useNavigate(); // Hook for programmatic navigation

//--------------------------------------------------------------------------------------------------------//

    // Update form inputs and reset specific error when input changes
    const updateForm = (value: Partial<FormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [Object.keys(value)[0]]: '', // Clear the error for the updated input field
        }));
    };

//--------------------------------------------------------------------------------------------------------//

    // Validate form inputs
    const validateForm = (): boolean => {
        const newErrors: Partial<FormState> = {};
        let valid = true;

        if (!form.identifier.trim()) {
            newErrors.identifier = 'Username or Account Number is required'; // Validate identifier field
            valid = false;
        }

        if (!form.password.trim()) {
            newErrors.password = 'Password is required'; // Validate password field
            valid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'; // Check password length
            valid = false;
        }

        setErrors(newErrors); // Set new errors if any
        return valid; // Return whether the form is valid
    };

//--------------------------------------------------------------------------------------------------------//

    // Handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true); // Set form as submitted

        if (!validateForm()) return; // If validation fails, stop submission

        const userCredentials = { ...form }; // Prepare credentials for login

        try {
            // Send login request to backend
            const response = await fetch('https://localhost:3001/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userCredentials), // Send credentials in request body
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrors({ identifier: 'Username or Account Number not found' }); // Handle user not found error
                } else if (response.status === 401) {
                    setErrors({ password: 'Incorrect password' }); // Handle incorrect password error
                }
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            const { token, firstName, userId } = data;

            // Save the JWT and user details to localStorage
            localStorage.setItem("jwt", token);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("userId", userId);

            setForm({ identifier: '', password: '' }); // Clear form fields after successful login
            navigate('/dashboard'); // Redirect to dashboard after login
        } catch (error) {
            window.alert(error); // Alert the error if any occurs during the request
        }
    };

//--------------------------------------------------------------------------------------------------------//

    return (
        <div
            className="full-page-container"
            style={{ backgroundImage: `url(${registerBackground})` }} // Set background image for the login page
        >
            <div className="login-form-container">
                <h3 className="text-center mb-4">Login Form</h3> {/* Title for the login form */}
                
                <form onSubmit={onSubmit}> {/* Form submission handler */}
                    {/* Input field for Username or Account Number */}
                    <div className="form-group mb-3 position-relative">
                        <label htmlFor="name" className="form-label">Username or Account Number</label>
                        <input
                            type="text"
                            className={`form-control ${submitted && errors.identifier ? 'is-invalid' : ''}`} // Add 'is-invalid' class if there's an error
                            id="name"
                            value={form.identifier}
                            onChange={(e) => updateForm({ identifier: e.target.value })} // Update form state on input change
                        />
                        {submitted && errors.identifier && (
                            <div className="custom-tooltip">{errors.identifier}</div> // Display error message for identifier
                        )}
                    </div>

                    {/* Input field for Password */}
                    <div className="form-group mb-3 position-relative">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${submitted && errors.password ? 'is-invalid' : ''}`} // Add 'is-invalid' class if there's an error
                            id="password"
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })} // Update form state on input change
                        />
                        {submitted && errors.password && (
                            <div className="custom-tooltip">{errors.password}</div> // Display error message for password
                        )}
                    </div>

                    {/* Submit button */}
                    <div className="text-center">
                        <input type="submit" value="Log in" className="btn btn-primary w-100" />
                    </div>
                </form>

                {/* Link to forgot password page */}
                <div className="text-center mt-4">
                    <Link to="/forgot-password" className="btn btn-outline-info">Forgot Password</Link>
                </div>

                {/* Link to sign-up page */}
                <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

//--------------------------------------------------------------------------------------------------------//

export default Login; // Export the Login component

//------------------------------------------END OF FILE---------------------------------------------------//

