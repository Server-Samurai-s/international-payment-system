import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Transaction document
export interface Transaction extends Document {
  user: mongoose.Types.ObjectId;
  recipientName: string;
  recipientBank: string;
  accountNumber: string;
  amount: number;
  swiftCode: string;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Schema definition
const transactionSchema = new Schema<Transaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientBank: { type: String, required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  swiftCode: { type: String, required: true },
  transactionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
});

// Create and export the model
export const TransactionModel = mongoose.model<Transaction>('Transaction', transactionSchema);

//--------------------------------------------------------------------------------------------------------//

// Function to retrieve the plain account number (no hashing needed)
export async function getAccountNumber(accountNumber: string): Promise<string> {
    return accountNumber; // Simply return the plain account number
}

//--------------------------------------------------------------------------------------------------------//

// Function to compare a plain account number with another for validation (no hashing comparison needed)
export async function compareAccountNumbers(accountNumber1: string, accountNumber2: string): Promise<boolean> {
    return accountNumber1 === accountNumber2; // Directly compare two plain account numbers
}

//------------------------------------------END OF FILE---------------------------------------------------//
