import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

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
        firstName: "",
        lastName: "",
        emailAddress: "",
        username: "",
        password: "",
        confirmPassword: "",
        accountNumber: "",
        idNumber: "",
    });

    const navigate = useNavigate();

    function updateForm(value: Partial<FormState>) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const newUser = { ...form };

        try {
            const response = await fetch("https://localhost:3001/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            setForm({
                firstName: "",
                lastName: "",
                emailAddress: "",
                username: "",
                password: "",
                confirmPassword: "",
                accountNumber: "",
                idNumber: "",
            });
            navigate("/login"); // Redirect to login page after successful sign-up
        } catch (error) {
            window.alert(error);
        }
    }

    return (
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: '600px', backgroundColor: '#f9f9f9' }}>
            <h3 className="text-center mb-4">Customer Registration Form</h3>
            <form onSubmit={onSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            value={form.firstName}
                            onChange={(e) => updateForm({ firstName: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            value={form.lastName}
                            onChange={(e) => updateForm({ lastName: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="emailAddress" className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailAddress"
                            value={form.emailAddress}
                            onChange={(e) => updateForm({ emailAddress: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={form.username}
                            onChange={(e) => updateForm({ username: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={form.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={form.confirmPassword}
                            onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="accountNumber" className="form-label">Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="accountNumber"
                            value={form.accountNumber}
                            onChange={(e) => updateForm({ accountNumber: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="idNumber" className="form-label">ID Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="idNumber"
                            value={form.idNumber}
                            onChange={(e) => updateForm({ idNumber: e.target.value })}
                        />
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button type="submit" className="btn btn-primary btn-lg">Submit</button>
                </div>
            </form>

            <div className="text-center mt-4">
                <p>An existing customer? <a href="/login" className="btn btn-outline-info">Click to Login</a></p>
            </div>
        </div>
    );
};

export default SignUp;
