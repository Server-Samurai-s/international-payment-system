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
    transactionDate: string;
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("https://localhost:3001/transactions", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch transactions');
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setError('Network error while fetching transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayAgain = (transaction: Transaction) => {
        navigate("/payment", { state: transaction });
    };

    const formatTransactionStatus = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="status-pending">Pending Verification</span>;
            case 'verified':
                return <span className="status-verified">Verified</span>;
            case 'submitted':
                return <span className="status-submitted">Processing</span>;
            case 'completed':
                return <span className="status-completed">Completed</span>;
            case 'failed':
                return <span className="status-failed">Failed</span>;
            default:
                return <span className="status-unknown">Unknown</span>;
        }
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
                    <div className="customer-dashboard__transactions">
                        <h2>Recent Transactions</h2>
                        
                        {isLoading && <div className="loading-spinner">Loading...</div>}
                        
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {!isLoading && !error && transactions.length === 0 && (
                            <div className="no-transactions">
                                No transactions found
                            </div>
                        )}

                        {transactions.map((transaction) => (
                            <div key={transaction._id} className="transaction-card">
                                <div className="transaction-header">
                                    <span className="recipient">{transaction.recipientName}</span>
                                    <span className="amount">${transaction.amount.toFixed(2)}</span>
                                </div>
                                <div className="transaction-details">
                                    <span className="bank">{transaction.recipientBank}</span>
                                    <span className="date">
                                        {transaction.transactionDate ? 
                                            new Date(transaction.transactionDate).toLocaleDateString() : 
                                            'Date not available'
                                        }
                                    </span>
                                </div>
                                <div className="transaction-status">
                                    {formatTransactionStatus(transaction.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;