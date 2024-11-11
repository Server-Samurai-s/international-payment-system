import React, { useEffect, useState } from 'react';
import { Transaction } from '../types/transaction';
import '../styles/verificationModal.css';

export interface VerificationStatus {
    recipientName: boolean;
    recipientBank: boolean;
    recipientAccountNo: boolean;
    amount: boolean;
    swiftCode: boolean;
}

interface VerificationModalProps {
    transaction: Transaction;
    verificationStatus: VerificationStatus;
    onVerifyField: (field: keyof VerificationStatus) => void;
    onSubmit: () => void;
    onReject: () => void;
    onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
    transaction,
    verificationStatus,
    onVerifyField,
    onSubmit,
    onReject,
    onClose
}) => {
    const [decryptedAccountNumber, setDecryptedAccountNumber] = useState<string>('');

    useEffect(() => {
        const fetchDecryptedAccount = async () => {
            try {
                const response = await fetch(`https://localhost:3001/employee/decrypt-account/${transaction.accountNumber}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDecryptedAccountNumber(data.accountNumber);
                }
            } catch (error) {
                console.error('Error decrypting account number:', error);
            }
        };
        fetchDecryptedAccount();
    }, [transaction.accountNumber]);

    return (
        <div className="verification-modal-overlay">
            <div className="verification-modal">
                <h3 className="verification-modal__title">Bank Employee Verification</h3>
                
                <div className="verification-field">
                    <div className="field-info">
                        <label>Recipient&apos;s Name:</label>
                        <span>{transaction.recipientName}</span>
                    </div>
                    <button 
                        className={`verify-btn ${verificationStatus.recipientName ? 'verified' : ''}`}
                        onClick={() => onVerifyField('recipientName')}
                    >
                        {verificationStatus.recipientName ? 'Verified' : 'Verify'}
                    </button>
                </div>

                <div className="verification-field">
                    <div className="field-info">
                        <label>Recipient&apos;s Bank:</label>
                        <span>{transaction.recipientBank}</span>
                    </div>
                    <button 
                        className={`verify-btn ${verificationStatus.recipientBank ? 'verified' : ''}`}
                        onClick={() => onVerifyField('recipientBank')}
                    >
                        {verificationStatus.recipientBank ? 'Verified' : 'Verify'}
                    </button>
                </div>

                <div className="verification-field">
                    <div className="field-info">
                        <label>Account Number:</label>
                        <span>{decryptedAccountNumber || 'Decrypting...'}</span>
                    </div>
                    <button 
                        className={`verify-btn ${verificationStatus.recipientAccountNo ? 'verified' : ''}`}
                        onClick={() => onVerifyField('recipientAccountNo')}
                    >
                        {verificationStatus.recipientAccountNo ? 'Verified' : 'Verify'}
                    </button>
                </div>

                <div className="verification-field">
                    <div className="field-info">
                        <label>Amount:</label>
                        <span>${transaction.amount}</span>
                    </div>
                    <button 
                        className={`verify-btn ${verificationStatus.amount ? 'verified' : ''}`}
                        onClick={() => onVerifyField('amount')}
                    >
                        {verificationStatus.amount ? 'Verified' : 'Verify'}
                    </button>
                </div>

                <div className="verification-field">
                    <div className="field-info">
                        <label>SWIFT Code:</label>
                        <span>{transaction.swiftCode}</span>
                    </div>
                    <button 
                        className={`verify-btn ${verificationStatus.swiftCode ? 'verified' : ''}`}
                        onClick={() => onVerifyField('swiftCode')}
                    >
                        {verificationStatus.swiftCode ? 'Verified' : 'Verify'}
                    </button>
                </div>
                
                <div className="verification-actions">
                    <button 
                        className="submit-btn"
                        disabled={!Object.values(verificationStatus).every(status => status)}
                        onClick={onSubmit}
                    >
                        Submit
                    </button>
                    <div className="verification-actions__secondary">
                        <button className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="reject-btn" onClick={onReject}>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal; 