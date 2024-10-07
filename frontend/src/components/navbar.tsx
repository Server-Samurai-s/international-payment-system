import React from "react"; // Import React for building the component
import "bootstrap/dist/css/bootstrap.css"; // Import Bootstrap CSS for styling
import { NavLink, useNavigate } from "react-router-dom"; // Import NavLink for navigation links and useNavigate for redirection

//--------------------------------------------------------------------------------------------------------//

const Navbar: React.FC = () => {
    const navigate = useNavigate(); // Hook for programmatic navigation

//--------------------------------------------------------------------------------------------------------//

    // Check if the user is logged in by checking the existence of a JWT token in localStorage
    const isLoggedIn = !!localStorage.getItem("jwt");

//--------------------------------------------------------------------------------------------------------//

    // Handle logout functionality
    const handleLogout = () => {
        localStorage.removeItem("jwt"); // Remove the JWT token from localStorage
        navigate("/login"); // Redirect the user to the login page after logout
    };

//--------------------------------------------------------------------------------------------------------//

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <NavLink className="navbar-brand" to="/">
                    {/* Add a logo or brand name here if needed */}
                </NavLink>
                <div className="navbar" id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        {/* Conditionally render the Dashboard link if the user is logged in */}
                        {isLoggedIn && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/dashboard">
                                    Dashboard
                                </NavLink>
                            </li>
                        )}
                        {/* Conditionally render Login and Register links if the user is not logged in */}
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
                        {/* Show Logout button if the user is logged in */}
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

//--------------------------------------------------------------------------------------------------------//

export default Navbar; // Export the Navbar component for use in other parts of the app

//------------------------------------------END OF FILE---------------------------------------------------//
