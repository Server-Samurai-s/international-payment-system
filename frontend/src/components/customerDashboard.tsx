import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import '../styles/customerDashboard.css';

interface DashboardState {
    firstName: string;
    balance: number;
    accountNumber: string;
}

interface Transaction {
    _id: string;
    recipientName: string;
    recipientBank: string;
    accountNumber: string;
    amount: number;
    transactionDate?: string;
    swiftCode: string;
    status: string;
}

const CustomerDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardState>({ 
        firstName: "", 
        balance: 0, 
        accountNumber: "" 
    });
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
            fetchBalance();
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchBalance = async () => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const response = await fetch("https://localhost:3001/user/balance", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setDashboard((prev) => ({
                        ...prev,
                        balance: data.balance,
                        accountNumber: data.accountNumber,
                    }));
                } else {
                    console.error("Failed to fetch balance");
                }
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        }
    };

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
        <div className="customer-dashboard__full-page-container">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="customer-dashboard__container">
                <h3 className="customer-dashboard__title">
                    <span style={{fontSize: "3rem"}}>welcome</span>
                    <br />
                    <span style={{ color: "#dedede" }}>{dashboard.firstName}</span>
                </h3>

                <div className="customer-dashboard__section">
                    <h5>Banking Details</h5>
                    <div className="customer-dashboard__banking-details">
                        <p><strong>Current Account</strong></p>
                        <p>Account No: {dashboard.accountNumber}</p>
                        <p>Available Balance: ${dashboard.balance.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <button onClick={handlePaymentsBtn} className="customer-dashboard__btn-main">
                            Make International Payment
                        </button>
                    </div>
                </div>
                
                <div className="customer-dashboard__section">
                    <h5 className="customer-dashboard__section-title">Payment Receipts</h5>
                    <div className="transaction-table-container">
                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Recipient</th>
                                    <th>Bank</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions
                                    .sort((a, b) => new Date(b.transactionDate || '').getTime() - new Date(a.transactionDate || '').getTime())
                                    .map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td>
                                            {transaction.transactionDate && !isNaN(Date.parse(transaction.transactionDate))
                                                ? new Date(transaction.transactionDate).toLocaleDateString()
                                                : "Unknown Date"}
                                        </td>
                                        <td>{transaction.recipientName}</td>
                                        <td>{transaction.recipientBank}</td>
                                        <td>${transaction.amount.toLocaleString()}</td>
                                        <td>{transaction.status ? transaction.status : "Failed"}</td>
                                        <td>
                                            <button 
                                                onClick={() => handlePayAgain(transaction)}
                                                className="verify-button"
                                            >
                                                Pay Again
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="empty-state">
                                            No payment receipts found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;