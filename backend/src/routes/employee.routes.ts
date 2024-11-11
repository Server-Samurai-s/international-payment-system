import express, { Request, Response } from 'express';
import EmployeeModel from '../models/employee';
import { employeeAuth } from '../middleware/employeeAuth';
import { TransactionModel } from '../models/transaction.model';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { EmployeeRole } from '../models/employee';
import { requireRole } from '../middleware/roleAuth';
import mongoose from 'mongoose';
import { User } from '../models/user';
import { decryptAccountNumber } from '../utils/encryption';
import crypto from 'crypto';

const router = express.Router();

// Generate employee ID using cryptographically secure random numbers
const generateEmployeeId = (): string => {
    // Generate 6 random bytes (48 bits)
    const randomBytes = crypto.randomBytes(6);
    // Convert to a number between 100000 and 999999
    const randomNum = (randomBytes.readUIntBE(0, 6) % 900000) + 100000;
    return `EMP${randomNum}`;
};

// Employee login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Login request body:', req.body); // Debug log

        if (!req.body || typeof req.body !== 'object') {
            res.status(400).json({ message: 'Invalid request body format' });
            return;
        }

        const { username, password } = req.body;
        
        if (!username || !password) {
            res.status(400).json({ 
                message: 'Username and password are required',
                debug: { receivedUsername: !!username, receivedPassword: !!password }
            });
            return;
        }

        const employee = await EmployeeModel.findOne({ username });
        if (!employee) {
            res.status(401).json({ message: 'Invalid login credentials' });
            return;
        }

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid login credentials' });
            return;
        }

        const token = jsonwebtoken.sign(
            { employeeId: employee.employeeId }, 
            process.env.JWT_SECRET!, 
            { expiresIn: '8h' }
        );

        res.json({ 
            token, 
            employee: {
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: employee.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
    }
});

// Get pending transactions
router.get('/transactions/pending', employeeAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const transactions = await TransactionModel.find({ status: 'pending' })
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify transaction
router.post('/transactions/:id/verify', employeeAuth, async (req: Request & { employeeId?: string }, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await TransactionModel.findById(req.params.id).session(session);
        if (!transaction) {
            await session.abortTransaction();
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        if (transaction.status !== 'pending') {
            await session.abortTransaction();
            res.status(400).json({ message: 'Transaction already processed' });
            return;
        }

        // Get sender and recipient documents
        const sender = await User.findById(transaction.user).session(session);
        const recipient = await User.findById(transaction.recipientId).session(session);

        if (!sender || !recipient) {
            await session.abortTransaction();
            res.status(404).json({ message: 'Sender or recipient not found' });
            return;
        }

        // Check if sender still has sufficient funds
        if (sender.balance < transaction.amount) {
            transaction.status = 'failed';
            await transaction.save({ session });
            await session.commitTransaction();
            res.status(400).json({ message: 'Insufficient funds' });
            return;
        }

        // Update balances using updateOne to avoid validation
        await User.updateOne(
            { _id: sender._id },
            { $inc: { balance: -transaction.amount } }
        ).session(session);

        await User.updateOne(
            { _id: recipient._id },
            { $inc: { balance: transaction.amount } }
        ).session(session);

        // Update transaction status
        transaction.status = 'verified';
        transaction.verifiedBy = req.employeeId;
        transaction.verificationDate = new Date().toISOString();
        await transaction.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Transaction verified and processed successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error verifying transaction:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
});

// Create new employee (Super Admin only)
router.post('/create', 
    employeeAuth, 
    requireRole([EmployeeRole.SUPER_ADMIN]), 
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { firstName, lastName, username, password, role } = req.body;

            // Validate role
            if (!Object.values(EmployeeRole).includes(role)) {
                res.status(400).json({ message: 'Invalid role' });
                return;
            }

            // Generate employee ID
            const employeeId = generateEmployeeId();

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newEmployee = new EmployeeModel({
                employeeId,
                firstName,
                lastName,
                username,
                password: hashedPassword,
                role
            });

            await newEmployee.save();

            res.status(201).json({
                message: 'Employee created successfully',
                employee: {
                    employeeId: newEmployee.employeeId,
                    firstName: newEmployee.firstName,
                    lastName: newEmployee.lastName,
                    username: newEmployee.username,
                    role: newEmployee.role
                }
            });
        } catch (error) {
            console.error('Error creating employee:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Add this new route
router.get('/decrypt-account/:encryptedAccount', employeeAuth, async (req: Request, res: Response) => {
    try {
        const decryptedAccount = decryptAccountNumber(req.params.encryptedAccount);
        res.json({ accountNumber: decryptedAccount });
    } catch (error) {
        console.error('Error decrypting account number:', error);
        res.status(500).json({ message: 'Error decrypting account number' });
    }
});

export default router;
