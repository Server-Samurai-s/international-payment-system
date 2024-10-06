import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    // Check if the user is logged in by checking for a token in localStorage
    const isLoggedIn = !!localStorage.getItem("jwt");

    // Handle logout function
    const handleLogout = () => {
        localStorage.removeItem("jwt"); // Remove the token
        navigate("/login"); // Redirect to the login page
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <NavLink className="navbar-brand" to="/">
                    {/* You can add a logo or brand name here */}
                </NavLink>
                <div className="navbar" id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        {/* Conditionally render Dashboard link if logged in */}
                        {isLoggedIn && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/dashboard">
                                    Dashboard
                                </NavLink>
                            </li>
                        )}
                        {/* Conditionally show Login/Register if not logged in */}
                        {!isLoggedIn && (
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
                        {/* Show logout button if the user is logged in */}
                        {isLoggedIn && (
                            <li className="nav-item">
                                <button className="nav-link btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
