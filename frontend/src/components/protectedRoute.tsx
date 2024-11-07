import React from 'react';
import { Navigate } from 'react-router-dom';
import { EmployeeRole } from '../types/employee';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: EmployeeRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const customerToken = localStorage.getItem("jwt");
    const employeeToken = localStorage.getItem("token");
    const employeeData = localStorage.getItem('employeeData');
    const isEmployee = localStorage.getItem("isEmployee") === 'true';

    // Check if user is authenticated
    if (!customerToken && !employeeToken) {
        return <Navigate to="/login" replace />;
    }

    // Check role restrictions if specified
    if (allowedRoles && employeeData) {
        const employee = JSON.parse(employeeData);
        if (!allowedRoles.includes(employee.role)) {
            return <Navigate to="/employee-dashboard" replace />;
        }
    }

    // If trying to access employee dashboard without employee privileges
    if (window.location.pathname === '/employee-dashboard' && !isEmployee) {
        return <Navigate to="/dashboard" replace />;
    }

    // If trying to access customer dashboard with employee privileges
    if (window.location.pathname === '/dashboard' && isEmployee) {
        return <Navigate to="/employee-dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;

//------------------------------------------END OF FILE---------------------------------------------------//