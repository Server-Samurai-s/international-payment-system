import express, { Response, NextFunction } from "express"; // Import express for routing, Request and Response types for type safety
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth"; // Import authentication middleware and custom request type
import { TransactionModel } from "../models/transaction"; // Import Transaction interface and Mongoose model
import validator from "validator"; // Import validator for input sanitization and validation
import rateLimit from "express-rate-limit"; // Import rate limiting middleware
import { User } from '../models/user';

//--------------------------------------------------------------------------------------------------------//

const router = express.Router(); // Initialize express router

// Set up rate limiting to prevent brute-force attacks
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  limit: 100, // Maximum 100 requests per IP during the window
  message: "Too many transactions from this IP, please try again later", // Message for rate limit exceeded
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
  [authenticateUser, transactionLimiter], // Apply authentication and rate limiting middlewares
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId; // Extract user ID from the authenticated request
      const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body; // Destructure transaction details from the request body

      // Validate the recipient name using regular expression
      if (!nameRegex.test(recipientName)) {
        res.status(400).json({ message: "Invalid recipient name" });
        return;
      }

      // Validate the recipient bank name
      if (!nameRegex.test(recipientBank)) {
        res.status(400).json({ message: "Invalid recipient bank" });
        return;
      }

      // Validate the account number
      if (!accountNumberRegex.test(accountNumber)) {
        res.status(400).json({ message: "Invalid account number" });
        return;
      }

      // Validate the transaction amount
      if (!amountRegex.test(amount)) {
        res.status(400).json({ message: "Invalid amount" });
        return;
      }

      // Validate the SWIFT code format
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

      // Create a new transaction using the Mongoose model
      const newTransaction = new TransactionModel({
        user: userId!,
        recipientName: validator.escape(recipientName),
        recipientBank: validator.escape(recipientBank),
        accountNumber: validator.escape(accountNumber),
        amount: parseFloat(amount),
        swiftCode: validator.escape(swiftCode),
        transactionDate: new Date(),
        status: 'pending'
      });

      const savedTransaction = await newTransaction.save();

      // Update user's balance
      user.balance -= parseFloat(amount);
      await user.save();

      res.status(201).json({ 
        message: "Transaction successful", 
        transaction: savedTransaction, 
        newBalance: user.balance 
      });
    } catch (e) {
      console.error("Error uploading transaction:", e); // Log any errors that occur during the process
      next(e);
    }
  }
);

//--------------------------------------------------------------------------------------------------------//

// GET - Retrieve all transactions for the authenticated user
router.get(
  "/",
  [authenticateUser, transactionLimiter], // Apply authentication and rate limiting middlewares
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId; // Extract user ID from the authenticated request
      // Use TransactionModel instead of Transaction
      const transactions = await TransactionModel.find({ user: userId }).exec(); // Find all transactions for the authenticated user

      // If no transactions are found, respond with a 404 status
      if (transactions.length === 0) {
        res.status(404).json({ message: "No transactions found" });
        return;
      }

      res.status(200).json(transactions); // Respond with the list of transactions
    } catch (e) {
      console.error("Error fetching transactions:", e); // Log any errors that occur during the process
      next(e);
    }
  }
);

//--------------------------------------------------------------------------------------------------------//

export default router; // Export the router for use in other parts of the application

//------------------------------------------END OF FILE---------------------------------------------------//
