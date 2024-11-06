import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for transaction data
export interface ITransaction extends Document {
    user: string;
    recipientName: string;
    recipientBank: string;
    accountNumber: string;
    amount: number;
    swiftCode: string;
    transactionDate?: Date;
}

// Define the Mongoose schema for the transaction model
const TransactionSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientName: { type: String, required: true },
    recipientBank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    swiftCode: { type: String, required: true },
    transactionDate: { type: Date, default: Date.now },
});

// Export the Mongoose model, `Transaction`
export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
