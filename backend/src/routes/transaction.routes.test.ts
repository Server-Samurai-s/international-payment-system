import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import transactionRoutes from './transaction.routes';
import { User } from '../models/user';
import { TransactionModel } from '../models/transaction.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

// Mock rate limiter and security middleware
jest.mock('express-rate-limit', () => jest.fn(() => 
  (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
));
jest.mock('helmet', () => jest.fn(() => 
  (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
));

const testUserId = new mongoose.Types.ObjectId();

// Update mocks to match new implementation
jest.mock('../models/user', () => ({
    User: {
        findById: jest.fn(),
    },
}));

jest.mock('../middleware/auth', () => ({
    authenticateUser: jest.fn((req, res, next) => {
        req.userId = testUserId;
        next();
    }),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.clearAllMocks();
});

describe('Transaction Routes', () => {
    describe('POST /transactions/create', () => {
        it('should create a new transaction with valid data', async () => {
            const initialBalance = 1000;
            const transactionAmount = 100.50;

            // Mock user lookup and save operation
            (User.findById as jest.Mock).mockResolvedValue({
                _id: testUserId,
                balance: initialBalance,
                save: jest.fn().mockResolvedValue(true),
            });

            const transactionData = {
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: transactionAmount.toString(),
                swiftCode: 'TESTUS33XXX',
            };

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(201);

            expect(response.body).toMatchObject({
                message: 'Transaction successful',
                transaction: expect.any(Object),
                newBalance: initialBalance - transactionAmount
            });

            // Verify transaction was saved
            const savedTransaction = await TransactionModel.findOne({ user: testUserId });
            expect(savedTransaction).toBeTruthy();
        });

        it('should return 400 for invalid SWIFT code', async () => {
            const transactionData = {
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'INVALID',
            };

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(400);

            expect(response.body).toEqual({ message: 'Invalid SWIFT code format' });
        });
    });

    describe('GET /transactions', () => {
        it('should retrieve all transactions for the authenticated user', async () => {
            const transactions = [
                {
                    user: testUserId,
                    amount: 100.50,
                    recipientName: 'Recipient One',
                    recipientBank: 'Bank One',
                    accountNumber: '1234567890',
                    swiftCode: 'BANKUS33XXX',
                    transactionDate: new Date(),
                    status: 'completed'
                },
                {
                    user: testUserId,
                    amount: 200.75,
                    recipientName: 'Recipient Two',
                    recipientBank: 'Bank Two',
                    accountNumber: '0987654321',
                    swiftCode: 'BANKUS33XXX',
                    transactionDate: new Date(),
                    status: 'completed'
                }
            ];

            await TransactionModel.insertMany(transactions);

            const response = await request(app)
                .get('/transactions')
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                user: testUserId.toString(),
                amount: transactions[0].amount,
                recipientName: transactions[0].recipientName,
                status: 'completed'
            });
        });

        it('should return 404 if no transactions found', async () => {
            const response = await request(app)
                .get('/transactions')
                .expect(404);

            expect(responseTransactions).toEqual(
                expect.arrayContaining(expectedTransactions)
            );
        });
    });
});
