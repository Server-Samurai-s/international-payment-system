import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/login.css'; // Add CSS for styling
import registerBackground from '../images/registerBackground.jpg'; // Use the same background image

interface FormState {
    identifier: string; // Could be username or account number
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        identifier: "",
        password: "",
    });
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
            [Object.keys(value)[0]]: "", // Reset the error for this field when user types
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormState> = {};
        let valid = true;

        if (!form.name.trim()) {
            newErrors.name = "Username or Account Number is required";
            valid = false;
        }

        if (!form.password.trim()) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        const newPerson = { ...form };

        try {
            const response = await fetch("https://localhost:3001/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPerson),
            });

                if (!response.ok) {
                    if (response.status === 404) {
                        setErrors({ name: "Username or Account Number not found" });
                    } else if (response.status === 401) {
                        setErrors({ password: "Incorrect password" });
                    }
                    throw new Error(`Error: ${response.statusText}`);
                }

            const data = await response.json();
            const { token, name } = data;

            console.log(`${name} ${token}`);

            // Save the JWT to localStorage
            localStorage.setItem("jwt", token);
            localStorage.setItem("name", name);

            setForm({ name: "", password: "" });
            navigate("/dashboard");
        } catch (error) {
            window.alert(error);
        }
    };

    return (
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: '400px', backgroundColor: '#f9f9f9' }}>
            <h3 className="text-center mb-4">Login Form</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="name" className="form-label">Username or Account Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>

                    <div className="form-group mb-3 position-relative">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control`}
                            id="password"
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                        />
                        {submitted && errors.password && (
                            <div className="custom-tooltip">{errors.password}</div>
                        )}
                    </div>

                    <div className="text-center">
                        <input type="submit" value="Log in" className="btn btn-primary w-100" />
                    </div>
                </form>

                <div className="text-center mt-4">
                    <a href="/forgot-password" className="btn btn-outline-info">Forgot Password</a>
                </div>

                <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/signup" className="btn btn-link">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
