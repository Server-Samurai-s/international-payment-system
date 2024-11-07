import express, { Response } from "express"; // Import express for routing, Request and Response types for type safety
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth"; // Import authentication middleware and custom request type
import { Transaction } from "../models/transaction"; // Import Transaction interface
import validator from "validator"; // Import validator for input sanitization and validation
import rateLimit from "express-rate-limit"; // Import rate limiting middleware
import helmet from "helmet"; // Import helmet for setting security-related HTTP headers
import { User } from '../models/user';

//--------------------------------------------------------------------------------------------------------//

const router = express.Router(); // Initialize express router

// Apply security headers to all routes using helmet
router.use(helmet());

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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      // Create a new transaction object and sanitize inputs
      const newTransaction: Transaction = {
        user: userId!, // Assign the authenticated user ID
        recipientName: validator.escape(recipientName), // Sanitize the recipient name
        recipientBank: validator.escape(recipientBank), // Sanitize the recipient bank
        accountNumber: validator.escape(accountNumber), // Store the plain account number
        amount: parseFloat(amount), // Parse and store the amount as a number
        swiftCode: validator.escape(swiftCode), // Sanitize the SWIFT code
        transactionDate: new Date().toISOString(), // Store the current date in ISO format
        status: 'pending' // Set initial status as pending
      };

      // Insert the new transaction into the database collection
      const collection = req.app.locals.db.collection("transactions");
      const result = await collection.insertOne(newTransaction);

      // Update user's balance
      user.balance -= parseFloat(amount);
      await user.save();

      res.status(201).json({ message: "Transaction successful", transaction: result, newBalance: user.balance });
    } catch (e) {
      console.error("Error uploading transaction:", e); // Log any errors that occur during the process
      res.status(500).send({ message: "Failed to upload transaction" }); // Respond with an error message
    }
  }
);

//--------------------------------------------------------------------------------------------------------//

// GET - Retrieve all transactions for the authenticated user
router.get(
  "/",
  [authenticateUser, transactionLimiter], // Apply authentication and rate limiting middlewares
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId; // Extract user ID from the authenticated request
      const collection = req.app.locals.db.collection("transactions"); // Access the transactions collection

      const transactions = await collection.find({ user: userId }).toArray(); // Find all transactions for the authenticated user

      // If no transactions are found, respond with a 404 status
      if (transactions.length === 0) {
        res.status(404).json({ message: "No transactions found" });
        return;
      }

      res.status(200).json(transactions); // Respond with the list of transactions
    } catch (e) {
      console.error("Error fetching transactions:", e); // Log any errors that occur during the process
      res.status(500).json({ message: "Failed to retrieve transactions" }); // Respond with an error message
    }
  }
);

//--------------------------------------------------------------------------------------------------------//

export default router; // Export the router for use in other parts of the application

//------------------------------------------END OF FILE---------------------------------------------------//
