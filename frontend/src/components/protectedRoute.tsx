import React from "react"; // Import React for building the component
import { Navigate } from "react-router-dom"; // Import Navigate for redirecting to another route

//--------------------------------------------------------------------------------------------------------//

// Define the interface for the ProtectedRoute component props
interface ProtectedRouteProps {
    children: JSX.Element; // The content that will be protected (e.g., a dashboard)
}

//--------------------------------------------------------------------------------------------------------//

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem("jwt"); // Check if a JWT token exists in localStorage (user is logged in)

    // If no token is found, redirect the user to the login page
    if (!token) {
        return <Navigate to="/login" replace />; // Redirect to login and replace the current history entry
    }

    // If a token is found, render the protected content (children)
    return children;
};

//--------------------------------------------------------------------------------------------------------//

export default ProtectedRoute; // Export the ProtectedRoute component for use in other parts of the app

//------------------------------------------END OF FILE---------------------------------------------------//