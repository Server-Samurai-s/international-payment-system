import express, { Response } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { TransactionModel } from '../models/transaction.model';
import validator from "validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { User, IUser } from '../models/user';
import { findUserByAccountNumber } from '../models/transaction';
import { encryptAccountNumber } from '../utils/encryption';
import mongoose from 'mongoose';

const router = express.Router();

// Rate limiting and security middleware
router.use(helmet());
const transactionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Apply rate limiting to all routes
router.use(transactionLimiter);

// Get all transactions for authenticated user
router.get("/", authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const transactions = await TransactionModel.find({
            $or: [
                { user: userId },
                { recipientId: userId }
            ]
        }).sort({ transactionDate: -1 });
        
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new transaction
router.post("/create", authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;
        const userId = req.userId;

        // Input validation
        if (!recipientName || !recipientBank || !accountNumber || !amount || !swiftCode) {
            await session.abortTransaction();
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Validate SWIFT code format (11 characters: 4 bank code, 2 country code, 2 location code, 3 branch code)
        const swiftCodeRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        if (!swiftCodeRegex.test(swiftCode)) {
            await session.abortTransaction();
            res.status(400).json({ message: "Invalid SWIFT code format" });
            return;
        }

        // Type assertion to ensure proper typing of MongoDB documents
        const sender = await User.findById(userId).session(session) as IUser | null;
        const recipient = await findUserByAccountNumber(accountNumber) as IUser | null;

        if (!sender || !recipient) {
            await session.abortTransaction();
            res.status(404).json({ message: "Sender or recipient not found" });
            return;
        }

        // Convert MongoDB ObjectIds to strings for comparison
        const senderId = sender._id.toString();
        const recipientId = recipient._id.toString();

        if (senderId === recipientId) {
            await session.abortTransaction();
            res.status(400).json({ message: "Cannot transfer to your own account" });
            return;
        }

        const newTransaction = new TransactionModel({
            user: userId,
            recipientId: recipient._id,
            recipientName: validator.escape(recipientName),
            recipientBank: validator.escape(recipientBank),
            accountNumber: encryptAccountNumber(accountNumber),
            amount: parseFloat(amount),
            swiftCode: validator.escape(swiftCode),
            transactionDate: new Date().toISOString(),
            status: 'pending',
            senderName: `${sender.firstName} ${sender.lastName}`
        });

        await newTransaction.save({ session });
        await session.commitTransaction();

        res.status(201).json({
            message: "Transaction submitted for verification",
            transaction: newTransaction
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error processing transaction:", error);
        res.status(500).json({ message: "Failed to process transaction" });
    } finally {
        session.endSession();
    }
});

router.get("/validate-account/:accountNumber", authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { accountNumber } = req.params;
        const user = await findUserByAccountNumber(accountNumber);

        if (!user) {
            res.status(404).json({ message: "Account number not found" });
            return;
        }

        res.status(200).json({ message: "Account number is valid" });
    } catch (error) {
        console.error("Error validating account number:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
