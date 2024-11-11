import mongoose, { Schema, Document } from 'mongoose';
import { Transaction } from '../models/transaction';

export interface ITransactionDocument extends Transaction, Document {}

const transactionSchema = new Schema({
    user: { type: String, required: true },
    recipientId: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientBank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    swiftCode: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'verified', 'submitted', 'completed', 'failed'],
        default: 'pending'
    },
    verifiedBy: { type: String, default: null },
    verificationDate: { type: Date, default: null },
    senderName: { type: String, required: true }
});

export const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);