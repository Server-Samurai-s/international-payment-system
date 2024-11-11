export interface Transaction {
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
