import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

interface FormState {
    identifier: string; // Could be username or account number
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        identifier: "",
        password: "",
    });
    const navigate = useNavigate();

    const updateForm = (value: Partial<FormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userCredentials = { ...form };

        try {
            const response = await fetch("https://localhost:3001/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userCredentials),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            const { token, firstName, userId } = data;

            console.log(`${firstName} ${userId} ${token}`);

            // Save the JWT and firstName to localStorage
            localStorage.setItem("jwt", token);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("userId", userId);

            setForm({ identifier: "", password: "" });
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
                    <label htmlFor="identifier" className="form-label">Username or Account Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="identifier"
                        value={form.identifier}
                        onChange={(e) => updateForm({ identifier: e.target.value })}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={form.password}
                        onChange={(e) => updateForm({ password: e.target.value })}
                    />
                </div>

                <div className="text-center">
                    <input type="submit" value="Log in" className="btn btn-primary w-100" />
                </div>
            </form>

            <div className="text-center mt-4">
                <a href="/forgot-password" className="btn btn-outline-info">Forgot Password</a>
            </div>
        </div>
    );
};

export default Login;
