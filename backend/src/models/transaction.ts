// Define the Transaction interface which includes user, recipient, and transaction details
export interface Transaction {
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

//--------------------------------------------------------------------------------------------------------//

// Update the existing functions with secure hashing
import { IUser } from './user';
import { User } from './user';
import { decryptAccountNumber } from '../utils/encryption';

export async function findUserByAccountNumber(accountNumber: string): Promise<IUser | null> {
    const users = await User.find();
    for (const user of users) {
        const decryptedAccountNumber = decryptAccountNumber(user.accountNumber);
        if (accountNumber === decryptedAccountNumber) {
            return user;
        }
    }
    return null;
}

//------------------------------------------END OF FILE---------------------------------------------------//