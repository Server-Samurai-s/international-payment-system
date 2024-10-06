import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import { useNavigate } from "react-router-dom";

interface DashboardState {
    firstName: string;
}



const CustomerDashboard: React.FC = () => {

    const [dashboard, setDashboard] = useState<DashboardState>({
        firstName: "",
    });

    const navigate = useNavigate();
    const handlePaymentsBtn = () => {
        navigate("/payment");
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("name"); // Assuming the user is stored in localStorage
        if (savedUser) {
            setDashboard((prev) => ({
                ...prev,
                firstName: savedUser,
            }));
        } else {
            navigate("/login"); // Redirect to login if user data is missing
        }
    }, [navigate]);

    return (
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: '800px', backgroundColor: '#f9f9f9' }}>
            <h3 className="text-center mb-4">Customer Dashboard</h3>
            
            {/* Customer Greeting */}
            <div className="text-center mb-4">
                <h5>Hello, {dashboard.firstName}</h5>
            </div>

            {/* Payments Buttons */}
            <div className="row mb-4">
                <div className="text-center">
                    <button onClick={handlePaymentsBtn} className="btn btn-outline-primary w-100">Make International Payment</button>
                </div>
            </div>

            {/* Banking Details */}
            <div className="mb-4">
                <h5>Banking Details</h5>
                <div className="p-3 border rounded bg-light">
                    <p><strong>Current Account</strong></p>
                    <p>Account No: XXXXXXXXXXXX</p>
                    <p>Available Balance: $1500.00</p>
                </div>
            </div>

            {/* Payment Receipts */}
            <div className="mb-4">
                <h5>Payment Receipts</h5>
                <div className="p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <p className="mb-0"><strong>2024/08/20</strong></p>
                            <p className="mb-0">School Fees</p>
                        </div>
                        <div>
                            <p className="mb-0">$200</p>
                            <button className="btn btn-primary btn-sm">Pay again</button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <p className="mb-0"><strong>2024/08/20</strong></p>
                            <p className="mb-0">Home Rent</p>
                        </div>
                        <div>
                            <p className="mb-0">$100</p>
                            <button className="btn btn-primary btn-sm">Pay again</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Menu */}
            <div className="mb-4">
                <div className="border rounded p-3" style={{ width: 'fit-content', margin: 'auto' }}>
                    <h6>Menu &gt;</h6>
                    <div className="mt-3">
                        <button className="btn btn-outline-secondary w-100 mb-2">Transactions &gt;</button>
                        <button className="btn btn-outline-secondary w-100">Payments &gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
