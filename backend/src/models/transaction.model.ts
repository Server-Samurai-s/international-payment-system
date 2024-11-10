import mongoose, { Schema, Document } from 'mongoose';
import { Transaction } from '../models/transaction';

export interface ITransactionDocument extends Transaction, Document {}

const transactionSchema = new Schema({
    user: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientBank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    swiftCode: { type: String, required: true },
    transactionDate: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'verified', 'submitted'],
        default: 'pending'
    },
    verifiedBy: { type: String },
    verificationDate: { type: String }
});

export const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);