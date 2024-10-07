import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import registerBackground from '../images/registerBackground.jpg';
import '../styles/customerDashboard.css'; 

interface DashboardState {
    firstName: string;
}

interface Transaction {
    _id: string;
    recipientName: string;
    recipientBank: string;
    amount: number;
    transactionDate: string; 
}

const CustomerDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardState>({ firstName: "" });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const navigate = useNavigate();

    const handlePaymentsBtn = () => {
        navigate("/payment");
    };

    useEffect(() => {
        const savedFirstName = localStorage.getItem("firstName");
        if (savedFirstName) {
            setDashboard((prev) => ({
                ...prev,
                firstName: savedFirstName,
            }));
            fetchTransactions();
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchTransactions = async () => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const response = await fetch("https://localhost:3001/transactions", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data);
                } else {
                    console.error("Failed to fetch transactions");
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }
    };

    const handlePayAgain = (transaction: Transaction) => {
        navigate("/payment", { state: transaction });
    };

    return (
        <div 
            className="customer-dashboard__full-page-container"
            style={{ backgroundImage: `url(${registerBackground})` }}
        >
            <div className="customer-dashboard__container">
                <h3 className="customer-dashboard__title">Welcome, {dashboard.firstName}</h3>

                <div className="customer-dashboard__section">
                    <h5>Banking Details</h5>
                    <div className="customer-dashboard__banking-details">
                        <p><strong>Current Account</strong></p>
                        <p>Account No: XXXXXXXXXXXX</p>
                        <p>Available Balance: $1500.00</p>
                    </div>
                </div>

                <div className="customer-dashboard__section">
                    <h5>Payment Receipts</h5>
                    <div className="customer-dashboard__transaction-list">
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <div key={transaction._id} className="customer-dashboard__transaction-item">
                                    <div>
                                        <p className="customer-dashboard__transaction-date">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                                        <p>{transaction.recipientName || 'Payment'}</p>
                                    </div>
                                    <div className="customer-dashboard__transaction-amount">
                                        <p>${transaction.amount}</p>
                                        <button 
                                            className="btn btn-primary btn-sm" 
                                            onClick={() => handlePayAgain(transaction)}
                                        >Pay again</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No payment receipts found</p>
                        )}
                    </div>
                </div>

                <div className="customer-dashboard__menu">
                    <h6>Quick Menu</h6>
                    <button className="btn customer-dashboard__menu-btn">Transactions</button>
                    <button className="btn customer-dashboard__menu-btn">Payments</button>
                </div>

                <div className="text-center">
                    <button onClick={handlePaymentsBtn} className="btn customer-dashboard__btn-main">Make International Payment</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
