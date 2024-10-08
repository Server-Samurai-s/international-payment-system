import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import SuccessMessage from "./successMessage";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Check login status whenever the component mounts or updates
        const checkLoginStatus = () => {
            const token = localStorage.getItem("jwt");
            setIsLoggedIn(!!token);
        };

        checkLoginStatus();
        // Set up an interval to periodically check login status
        const intervalId = setInterval(checkLoginStatus, 1000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate("/");
        }, 2000);
    };

    return (
        <header className="navbar-container">
            <nav className="navbar">
                <NavLink className="navbar-brand" to="/">
                    <h1>IntPay</h1>
                </NavLink>

                <div className="navbar-links">
                    <ul className="nav-links">
                        {isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/dashboard">
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn-logout" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/signUp">
                                        Register
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">
                                        Login
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
            {showSuccess && <SuccessMessage message="Logged out successfully! Redirecting to login..." />}
        </header>
    );
};

export default Navbar;