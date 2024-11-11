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
    user: string;
    recipientId: string;
    recipientName: string;
    recipientBank: string;
    accountNumber: string;
    amount: number;
    swiftCode: string;
    transactionDate: string;
    status: 'pending' | 'verified' | 'submitted' | 'completed' | 'failed';
    verifiedBy?: string;
    verificationDate?: string;
    senderName: string;
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

    const fetchTransactions = React.useCallback(async () => {
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
    }, [navigate, fetchTransactions]);

    const handlePaymentsBtn = () => {
        navigate("/payment");
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
                    <div className="transaction-table-container">
                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Bank</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                                        <td>
                                            {transaction.user === localStorage.getItem("userId") ? (
                                                <span className="transaction-direction outgoing">Sent</span>
                                            ) : (
                                                <span className="transaction-direction incoming">Received</span>
                                            )}
                                        </td>
                                        <td>
                                            {transaction.user === localStorage.getItem("userId") 
                                                ? transaction.recipientName 
                                                : transaction.senderName
                                            }
                                        </td>
                                        <td>
                                            {transaction.user === localStorage.getItem("userId") 
                                                ? transaction.recipientBank 
                                                : "IntPay"
                                            }
                                        </td>
                                        <td className={transaction.user === localStorage.getItem("userId") ? 'outgoing' : 'incoming'}>
                                            ${transaction.amount.toLocaleString()}
                                        </td>
                                        <td>{formatTransactionStatus(transaction.status)}</td>
                                    </tr>
                                ))}
                                {!isLoading && !error && transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty-state">
                                            No transactions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {isLoading && <div className="loading-spinner">Loading...</div>}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;