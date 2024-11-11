import express, { Response } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { TransactionModel } from '../models/transaction.model';
import validator from "validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { User } from '../models/user';
import { encryptAccountNumber } from '../utils/encryption';
import mongoose from 'mongoose';
import { findUserByAccountNumber } from "../models/transaction";

const router = express.Router();

// Your existing middleware setup remains the same
router.use(helmet());
const transactionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many transactions from this IP, please try again later",
});

//--------------------------------------------------------------------------------------------------------//

// Regular expressions for input validation
const nameRegex = /^[A-Za-z\s]+$/; // Allow alphabets and spaces only
const accountNumberRegex = /^\d{6,34}$/; // Account number should be 6 to 34 digits long
const amountRegex = /^[1-9]\d*(\.\d+)?$/; // Positive numbers, allow decimals
const swiftCodeRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // SWIFT code format validation

//--------------------------------------------------------------------------------------------------------//

// POST - Create a new transaction with validation and security checks
router.post(
    "/create",
    [authenticateUser, transactionLimiter],
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;

            if (!nameRegex.test(recipientName)) {
                res.status(400).json({ message: "Invalid recipient name" });
                return;
            }

            if (!nameRegex.test(recipientBank)) {
                res.status(400).json({ message: "Invalid recipient bank" });
                return;
            }

            if (!accountNumberRegex.test(accountNumber)) {
                res.status(400).json({ message: "Invalid account number" });
                return;
            }

            if (!amountRegex.test(amount)) {
                res.status(400).json({ message: "Invalid amount" });
                return;
            }

            if (!swiftCodeRegex.test(swiftCode)) {
                res.status(400).json({ message: "Invalid SWIFT code format" });
                return;
            }

            const sender = await User.findById(userId);
            if (!sender) {
                res.status(404).json({ message: "Sender not found" });
                return;
            }

            if (sender.balance < parseFloat(amount)) {
                res.status(400).json({ message: "Insufficient funds" });
                return;
            }

            const recipient = await findUserByAccountNumber(accountNumber);
            if (!recipient) {
                res.status(404).json({ message: "Recipient account not found" });
                return;
            }

            const senderId = sender._id as unknown as mongoose.Types.ObjectId;
            const recipientId = recipient._id as unknown as mongoose.Types.ObjectId;

            if (senderId.toString() === recipientId.toString()) {
                res.status(400).json({ message: "Cannot transfer to your own account" });
                return;
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                sender.balance -= parseFloat(amount);
                await sender.save({ session });

                recipient.balance += parseFloat(amount);
                await recipient.save({ session });

                const newTransaction = new TransactionModel({
                    user: userId,
                    recipientName: validator.escape(recipientName),
                    recipientBank: validator.escape(recipientBank),
                    accountNumber: encryptAccountNumber(accountNumber),
                    amount: parseFloat(amount),
                    swiftCode: validator.escape(swiftCode),
                    transactionDate: new Date().toISOString(),
                    status: 'pending'
                });

                await newTransaction.save({ session });
                await session.commitTransaction();

                res.status(201).json({
                    message: "Transaction successful",
                    transaction: newTransaction,
                    newBalance: sender.balance
                });
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error("Error processing transaction:", error);
            res.status(500).json({ message: "Failed to process transaction" });
        }
    }
);

router.get(
    "/",
    [authenticateUser, transactionLimiter],
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            const transactions = await TransactionModel.find({ user: userId })
                .sort({ transactionDate: -1 })
                .exec();

            if (transactions.length === 0) {
                res.status(404).json({ message: "No transactions found" });
                return;
            }

            res.status(200).json(transactions);
        } catch (e) {
            console.error("Error fetching transactions:", e);
            res.status(500).json({ message: "Failed to retrieve transactions" });
        }
    }
);

export default router;
