import express, { Request, Response } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { Transaction } from "../models/transaction";  // Correctly import the Mongoose model
import validator from "validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { User } from '../models/user';
import cookieSession from "cookie-session";

const xss = require("xss-clean");
const router = express.Router();

// Apply security headers with Helmet
router.use(helmet());

// Cookie-based session to prevent session hijacking
router.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET || "default_secret_key"],
  maxAge: 24 * 60 * 60 * 1000,
}));

// XSS Protection
router.use(xss());

// Rate limiting
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many transactions from this IP, please try again later.",
});

// Set HSTS for MITM protection
router.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Validation regex patterns
const nameRegex = /^[A-Za-z\s]+$/;
const accountNumberRegex = /^\d{6,34}$/;
const amountRegex = /^[1-9]\d*(\.\d+)?$/;
const swiftCodeRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// POST - Create a transaction
router.post(
  "/create",
  [authenticateUser, transactionLimiter],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;

      // Validate inputs
      if (!nameRegex.test(recipientName) || !nameRegex.test(recipientBank)) {
        res.status(400).json({ message: "Invalid recipient name or bank" });
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
        res.status(400).json({ message: "Invalid SWIFT code" });
        return;
      }

      const user = await User.findById(userId);
      if (!user || user.balance < parseFloat(amount)) {
        res.status(400).json({ message: "User not found or insufficient funds" });
        return;
      }

      // Create a new transaction document using Mongoose
      const newTransaction = new Transaction({
        user: userId!,
        recipientName: validator.escape(recipientName),
        recipientBank: validator.escape(recipientBank),
        accountNumber: validator.escape(accountNumber),
        amount: parseFloat(amount),
        swiftCode: validator.escape(swiftCode),
        transactionDate: new Date(),
      });

      // Save the transaction using Mongoose
      const savedTransaction = await newTransaction.save();

      // Update user's balance
      user.balance -= parseFloat(amount);
      await user.save();

      res.status(201).json({ message: "Transaction successful", transaction: savedTransaction, newBalance: user.balance });
    } catch (e) {
      console.error("Error uploading transaction:", e);
      res.status(500).send({ message: "Failed to upload transaction" });
    }
  }
);

// GET - Retrieve all transactions for authenticated user
router.get(
  "/",
  [authenticateUser, transactionLimiter],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      // Retrieve transactions using Mongoose
      const transactions = await Transaction.find({ user: userId }).exec();

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
