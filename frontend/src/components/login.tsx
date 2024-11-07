import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import '../styles/login.css';
import SuccessMessage from './successMessage';
import CustomerLogin from './CustomerLogin';
import EmployeeLogin from './EmployeeLogin';

const Login: React.FC = () => {
    const [isEmployee, setIsEmployee] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleLoginSuccess = () => {
        setShowSuccess(true);
    };

    return (
        <div className="full-page-container">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="login-form-container">
                <div className="login-type-toggle">
                    <button 
                        className={!isEmployee ? 'active' : ''} 
                        onClick={() => setIsEmployee(false)}
                    >
                        Customer Login
                    </button>
                    <button 
                        className={isEmployee ? 'active' : ''} 
                        onClick={() => setIsEmployee(true)}
                    >
                        Employee Login
                    </button>
                </div>

                {isEmployee ? (
                    <EmployeeLogin onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <CustomerLogin onLoginSuccess={handleLoginSuccess} />
                )}

                {showSuccess && <SuccessMessage message="Login successful! Redirecting..." />}
            </div>
        </div>
    );
};

export default Login; 