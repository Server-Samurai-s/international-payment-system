import express, { Request, Response } from 'express';
import EmployeeModel from '../models/employee';
import { employeeAuth } from '../middleware/employeeAuth';
import { TransactionModel } from '../models/transaction.model';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { EmployeeRole } from '../models/employee';
import { requireRole } from '../middleware/roleAuth';
import { User as UserModel } from '../models/user'; // Import the User model as UserModel

const router = express.Router();

// Employee login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        
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
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending transactions
router.get('/transactions/pending', employeeAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const transactions = await TransactionModel.find({ status: 'pending' })
            .sort({ transactionDate: -1 });
        
        // Log the transactions to see what gets returned
        console.log('Pending transactions:', transactions);
        
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify transaction and update recipient's balance
router.post('/transactions/:id/verify', employeeAuth, async (req: Request & { employeeId?: string }, res: Response): Promise<void> => {
    try {
        console.log('Verifying transaction with ID:', req.params.id);

        const transaction = await TransactionModel.findById(req.params.id);
        if (!transaction) {
            console.log('Transaction not found for ID:', req.params.id);
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        console.log('Transaction found:', transaction);

        // Find the recipient by their account number
        const recipient = await UserModel.findOne({ accountNumber: transaction.accountNumber });
        console.log('Recipient:', recipient);
        if (!recipient) {
            console.log('Recipient not found for account number:', transaction.accountNumber);
            res.status(404).json({ message: 'Recipient not found' });
            return;
        }

        // Update the recipient's balance
        recipient.balance += transaction.amount;
        console.log('New balance for recipient:', recipient.balance);
        await recipient.save();

        // Update the transaction status
        transaction.status = 'verified';
        transaction.verifiedBy = req.employeeId;
        transaction.verificationDate = new Date().toISOString();
        await transaction.save();

        console.log('Transaction verified and recipient balance updated successfully');
        res.json({ message: 'Transaction verified and recipient balance updated successfully' });
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ message: 'Server error' });
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
            const employeeId = `EMP${Math.floor(100000 + Math.random() * 900000)}`;

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
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;