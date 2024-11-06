import express, { Response } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { Transaction } from "../models/transaction";
import validator from "validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean"; // XSS protection
import { User } from '../models/user';
import cookieSession from "cookie-session"; // For session hijacking protection

const router = express.Router();

// Apply security headers to all routes using Helmet
router.use(helmet());

// Set up cookie-based session to prevent session hijacking
router.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET || "default_secret_key"], // Use an environment variable for the secret key
  maxAge: 24 * 60 * 60 * 1000 // Set session duration to 24 hour
}));

// XSS Protection middleware
router.use(xss());

// Set up rate limiting to prevent brute-force and DDoS attacks
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many transactions from this IP, please try again later."
});

// HSTS middleware for MITM protection
router.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Regular expressions for input validation
const nameRegex = /^[A-Za-z\s]+$/;
const accountNumberRegex = /^\d{6,34}$/;
const amountRegex = /^[1-9]\d*(\.\d+)?$/;
const swiftCodeRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// POST - Create a new transaction with validation and security checks
router.post(
  "/create",
  [authenticateUser, transactionLimiter],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;

      // Validation for each input field
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

      const newTransaction: Transaction = {
        user: userId!,
        recipientName: validator.escape(recipientName),
        recipientBank: validator.escape(recipientBank),
        accountNumber: validator.escape(accountNumber),
        amount: parseFloat(amount),
        swiftCode: validator.escape(swiftCode),
        transactionDate: new Date().toISOString(),
      };

      const collection = req.app.locals.db.collection("transactions");
      const result = await collection.insertOne(newTransaction);

      user.balance -= parseFloat(amount);
      await user.save();

      res.status(201).json({ message: "Transaction successful", transaction: result, newBalance: user.balance });
    } catch (e) {
      console.error("Error uploading transaction:", e);
      res.status(500).send({ message: "Failed to upload transaction" });
    }
  }
);

// GET - Retrieve all transactions for the authenticated user
router.get(
  "/",
  [authenticateUser, transactionLimiter],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const collection = req.app.locals.db.collection("transactions");

      const transactions = await collection.find({ user: userId }).toArray();

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
