import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import '../styles/employeeDashboard.css';
import { Transaction } from '../types/transaction';
import { EmployeeRole } from '../types/employee';
import VerificationModal, { VerificationStatus } from './verificationModal';

interface EmployeeDashboardProps {
    firstName: string;
    lastName: string;
    role: EmployeeRole;
}

const EmployeeDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<EmployeeDashboardProps>({
        firstName: "",
        lastName: "",
        role: EmployeeRole.AGENT
    });
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
        recipientName: false,
        recipientBank: false,
        recipientAccountNo: false,
        amount: false,
        swiftCode: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const employeeData = localStorage.getItem('employeeData');
        
        if (!token || !employeeData) {
            navigate('/login');
            return;
        }

        const employee = JSON.parse(employeeData);
        setDashboard(employee);
        fetchPendingTransactions();
    }, [navigate]);

    const fetchPendingTransactions = async () => {
        try {
            const response = await fetch('https://localhost:3001/employee/transactions/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPendingTransactions(data);
            } else {
                const errorData = await response.json();
                console.error('Error fetching transactions:', errorData.message);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleVerifyField = (field: keyof VerificationStatus) => {
        setVerificationStatus((prev: VerificationStatus) => ({
            ...prev,
            [field]: true
        }));
    };

    const handleSubmitVerification = async () => {
        if (Object.values(verificationStatus).every(status => status)) {
            await handleVerifyTransaction(selectedTransaction!._id);
            setSelectedTransaction(null);
            setVerificationStatus({
                recipientName: false,
                recipientBank: false,
                recipientAccountNo: false,
                amount: false,
                swiftCode: false
            });
        }
    };

    const handleVerifyTransaction = async (transactionId: string) => {
        try {
            const response = await fetch(`https://localhost:3001/employee/transactions/${transactionId}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                fetchPendingTransactions(); // Refresh the list
            } else {
                const errorData = await response.json();
                console.error('Error verifying transaction:', errorData.message);
            }
        } catch (error) {
            console.error('Error verifying transaction:', error);
        }
    };

    return (
        <div className="employee-dashboard__full-page-container">
            <Canvas className="background-animation">
                <Stars radius={100} depth={50} count={5000} factor={4} fade />
            </Canvas>
            <div className="employee-dashboard__container">
                <h3 className="employee-dashboard__title">
                    <span style={{fontSize: "3rem"}}>welcome</span>
                    <br />
                    <span style={{ color: "#dedede" }}>{dashboard.firstName}</span>
                </h3>

                <div className="employee-dashboard__section">
                    <h5>Employee Details</h5>
                    <div className="employee-dashboard__details">
                        <p><strong>Role:</strong> {dashboard.role}</p>
                        <p><strong>Name:</strong> {dashboard.firstName} {dashboard.lastName}</p>
                        {dashboard.role === EmployeeRole.SUPER_ADMIN && (
                            <button 
                                onClick={() => navigate('/create-employee')} 
                                className="create-employee-btn"
                            >
                                Create New Employee
                            </button>
                        )}
                    </div>
                </div>

                <div className="employee-dashboard__section">
                    <h5 className="employee-dashboard__section-title">Pending Transactions</h5>
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
                                {pendingTransactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td>{new Date(transaction.transactionDate!).toLocaleDateString()}</td>
                                        <td>{transaction.recipientName}</td>
                                        <td>{transaction.recipientBank}</td>
                                        <td>${transaction.amount.toLocaleString()}</td>
                                        <td>
                                            <span className="status-badge">Pending</span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => setSelectedTransaction(transaction)}
                                                className="verify-button"
                                            >
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty-state">
                                            No pending transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedTransaction && (
                <VerificationModal
                    transaction={selectedTransaction}
                    verificationStatus={verificationStatus}
                    onVerifyField={handleVerifyField}
                    onSubmit={handleSubmitVerification}
                    onReject={() => setSelectedTransaction(null)}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard; 