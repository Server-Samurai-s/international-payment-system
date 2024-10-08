import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Navbar.css"; // Custom CSS for navbar

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("jwt");

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    return (
        <header className="navbar-container">
            <nav className="navbar">
                {/* Logo or Brand Name */}
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
        </header>
    );
};

export default Navbar;
