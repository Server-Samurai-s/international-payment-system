import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmployeeRole } from './types/employee';
import Navbar from './components/navbar';
import Login from './components/login';
import SignUp from './components/signUp';
import Dashboard from './components/customerDashboard';
import EmployeeDashboard from './components/employeeDashboard';
import CreateEmployee from './components/createEmployee';
import ProtectedRoute from './components/protectedRoute';
import Payment from './components/payment';
import LandingPage from './components/landingPage';

const App: React.FC = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee-dashboard" 
                    element={
                        <ProtectedRoute>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/create-employee" 
                    element={
                        <ProtectedRoute allowedRoles={[EmployeeRole.SUPER_ADMIN]}>
                            <CreateEmployee />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/payment" 
                    element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;

