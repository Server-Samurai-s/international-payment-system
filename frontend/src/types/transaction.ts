export interface Transaction {
    _id: string;
    user: string;
    recipientName: string;
    recipientBank: string;
    recipientAccountNo: string;
    amount: number;
    swiftCode: string;
    transactionDate: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verificationDate?: string;
}
