import express, { Response, Request } from "express";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { Transaction, hashAccountNumber } from "../models/transaction";
import validator from "validator"; // For input validation and sanitization
import rateLimit from "express-rate-limit"; // Rate limiting
import helmet from "helmet"; // Security headers

const router = express.Router();

// Apply security headers using helmet
router.use(helmet());

// Set rate limiting to avoid brute force attacks
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many transactions from this IP, please try again later",
});

// Regular expressions for validation
const nameRegex = /^[A-Za-z\s]+$/; // Only alphabets and spaces
const accountNumberRegex = /^\d{6,34}$/; // 6 to 34 digits
const amountRegex = /^[1-9]\d*(\.\d+)?$/; // Positive numbers
const swiftCodeRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // SWIFT code format

// POST - Create transaction securely
router.post(
  "/create",
  [authenticateUser, transactionLimiter],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;

      // Validate inputs using regex
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

      // Hash account number before storing it
      const hashedAccountNumber = await hashAccountNumber(accountNumber);

      const newTransaction: Transaction = {
        user: userId!,
        recipientName: validator.escape(recipientName), // Sanitize input
        recipientBank: validator.escape(recipientBank), // Sanitize input
        accountNumber: hashedAccountNumber,
        amount: parseFloat(amount),
        swiftCode: validator.escape(swiftCode), // Sanitize input
      };

      const collection = req.app.locals.db.collection("transactions");
      const result = await collection.insertOne(newTransaction);
      res.status(201).send(result);
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
