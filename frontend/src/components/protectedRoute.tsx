import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: JSX.Element; // Protected content (e.g., dashboard)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem("jwt"); // Check if the user is logged in by checking for the token

    // If the token doesn't exist, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists, allow access to the protected component
    return children;
};

export default ProtectedRoute;
