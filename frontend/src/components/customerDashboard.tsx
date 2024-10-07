import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { useNavigate } from "react-router-dom";

// Define types for transactions and dashboard state
interface DashboardState {
    firstName: string;
}

interface Transaction {
    _id: string;
    recipientName: string;
    recipientBank: string;
    amount: number;
    transactionDate: string; // assuming it's stored as a string in the database
}

const CustomerDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardState>({ firstName: "" });
    const [transactions, setTransactions] = useState<Transaction[]>([]); // State for storing transactions
    const navigate = useNavigate();

    const handlePaymentsBtn = () => {
        navigate("/payment");
    };

    useEffect(() => {
        const savedFirstName = localStorage.getItem("firstName"); // Now fetching firstName
        if (savedFirstName) {
            setDashboard((prev) => ({
                ...prev,
                firstName: savedFirstName,  // Using firstName for greeting
            }));

            // Fetch transactions from the backend for this user
            fetchTransactions();
        } else {
            navigate("/login"); // Redirect to login if user data is missing
        }
    }, [navigate]);

    // Function to fetch transactions
    const fetchTransactions = async () => {
        const token = localStorage.getItem("jwt"); // Assuming JWT token is stored in localStorage
        if (token) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Pass the token for authorization
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Transactions fetched:', data); // Log the response data
                    setTransactions(data);
                } else {
                    console.error("Failed to fetch transactions");
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }
    };

    // Handle "Pay again" button click
    const handlePayAgain = (transaction: Transaction) => {
        navigate("/payment", { state: transaction }); // Pass the transaction data
    };
    

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
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div key={transaction._id} className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <p className="mb-0"><strong>{new Date(transaction.transactionDate).toLocaleDateString()}</strong></p>
                                    <p className="mb-0">{transaction.recipientName || 'Payment'}</p>
                                </div>
                                <div>
                                    <p className="mb-0">${transaction.amount}</p>
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => handlePayAgain(transaction)} // Pass transaction to handler
                                    >Pay again</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No payment receipts found</p>
                    )}
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
