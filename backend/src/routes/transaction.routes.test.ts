import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import transactionRoutes from './transaction.routes';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

// Mock mongoose first
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: jest.fn().mockImplementation(() => ({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        })),
        Types: {
            ObjectId: actualMongoose.Types.ObjectId
        }
    };
});

// Mock User model
jest.mock('../models/user', () => ({
    User: {
        findById: jest.fn().mockImplementation(() => ({
            session: jest.fn().mockReturnThis(),
            _id: new mongoose.Types.ObjectId(),
            firstName: 'John',
            lastName: 'Doe',
            balance: 1000,
            save: jest.fn().mockResolvedValue(true)
        }))
    }
}));

// Mock TransactionModel
jest.mock('../models/transaction.model', () => {
    class MockTransactionModel {
        constructor(data: any) {
            return {
                ...data,
                save: jest.fn().mockResolvedValue(data)
            };
        }

        static find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        static create = jest.fn().mockImplementation((data) => new MockTransactionModel(data));
    }

    return {
        TransactionModel: MockTransactionModel
    };
});

// Add constructor mock
(global as any).TransactionModel = function(data: any) {
    return {
        ...data,
        save: jest.fn().mockResolvedValue(true)
    };
};

// Mock findUserByAccountNumber
jest.mock('../models/transaction', () => ({
    findUserByAccountNumber: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Jane',
        lastName: 'Smith',
        balance: 2000,
        save: jest.fn().mockResolvedValue(true)
    })
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
    authenticateUser: (req: any, _res: any, next: any) => {
        req.userId = new mongoose.Types.ObjectId().toString();
        next();
    }
}));

const generateTestToken = () => {
    return jwt.sign(
        { userId: new mongoose.Types.ObjectId().toString() },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

describe('Transaction Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /transactions/create', () => {
        it('should create a new transaction with valid data', async () => {
            const token = generateTestToken();
            const transactionData = {
                recipientName: 'Jane Smith',
                recipientBank: 'Test Bank',
                accountNumber: '123456789012',
                amount: 100.50,
                swiftCode: 'TESTUS33XXX',
                senderName: 'John Doe',
                transactionDate: new Date().toISOString()
            };

            const response = await request(app)
                .post('/transactions/create')
                .set('Authorization', `Bearer ${token}`)
                .send(transactionData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Transaction submitted for verification');
        });

        it('should return 400 for invalid SWIFT code', async () => {
            const token = generateTestToken();
            const transactionData = {
                recipientName: 'Jane Smith',
                recipientBank: 'Test Bank',
                accountNumber: '123456789012',
                amount: 100.50,
                swiftCode: 'INVALID',
                senderName: 'John Doe',
                transactionDate: new Date().toISOString()
            };

            const response = await request(app)
                .post('/transactions/create')
                .set('Authorization', `Bearer ${token}`)
                .send(transactionData)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Invalid SWIFT code format');
        });
    });

    describe('GET /transactions', () => {
        it('should retrieve all transactions for the authenticated user', async () => {
            const token = generateTestToken();
            const mockTransaction = {
                user: new mongoose.Types.ObjectId().toString(),
                recipientId: new mongoose.Types.ObjectId().toString(),
                recipientName: 'Test Recipient',
                recipientBank: 'Test Bank',
                accountNumber: '123456789012',
                amount: 100.50,
                swiftCode: 'TESTUS33XXX',
                transactionDate: new Date(),
                status: 'completed',
                senderName: 'John Doe'
            };

            const response = await request(app)
                .get('/transactions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
});
