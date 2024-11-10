import express, { Response } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { TransactionModel } from '../models/transaction.model';
import validator from "validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { User } from '../models/user';

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

            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (user.balance < parseFloat(amount)) {
                res.status(400).json({ message: "Insufficient funds" });
                return;
            }

            const newTransaction = new TransactionModel({
                user: userId!,
                recipientName: validator.escape(recipientName),
                recipientBank: validator.escape(recipientBank),
                accountNumber: validator.escape(accountNumber),
                amount: parseFloat(amount),
                swiftCode: validator.escape(swiftCode),
                transactionDate: new Date().toISOString(),
                status: 'pending'
            });

            const savedTransaction = await newTransaction.save();

            user.balance -= parseFloat(amount);
            await user.save();

            res.status(201).json({ 
                message: "Transaction successful", 
                transaction: savedTransaction, 
                newBalance: user.balance 
            });
        } catch (e) {
            console.error("Error uploading transaction:", e);
            res.status(500).json({ message: "Failed to upload transaction" });
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
