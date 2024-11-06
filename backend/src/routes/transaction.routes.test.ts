import request from 'supertest';
import express from 'express';
import transactionRoutes from './transaction.routes';
import { User } from '../models/user';
import { ObjectId } from 'mongodb';

jest.mock('../models/user', () => ({
    User: {
        findById: jest.fn(),
    },
}));

jest.mock('express-rate-limit', () => jest.fn(() => (_req: express.Request, res: express.Response, next: express.NextFunction) => next()));
jest.mock('helmet', () => jest.fn(() => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()));

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

jest.mock('../middleware/auth', () => ({
    authenticateUser: jest.fn((req, res, next) => {
        req.userId = new ObjectId().toHexString();
        next();
    }),
}));

const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
    }),
};

app.locals.db = {
    collection: jest.fn().mockReturnValue(mockCollection),
};

describe('Transaction Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /transactions/create', () => {
        it('should create a new transaction with valid data', async () => {
            const testUserId = new ObjectId();
            const initialBalance = 1000;
            const transactionAmount = 100.50;

            (User.findById as jest.Mock).mockResolvedValue({
                _id: testUserId,
                balance: initialBalance,
                save: jest.fn().mockResolvedValue(true),
            });

            mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

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

            expect(response.body).toHaveProperty('message', 'Transaction successful');
            expect(response.body).toHaveProperty('transaction');
            expect(response.body).toHaveProperty('newBalance', initialBalance - transactionAmount);

            expect(User.findById).toHaveBeenCalled();
            expect(mockCollection.insertOne).toHaveBeenCalled();
        });

        it('should return 400 for invalid recipient name', async () => {
            const transactionData = {
                recipientName: 'John123',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33XXX',
            };

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(400);

            expect(response.body).toEqual({ message: 'Invalid recipient name or bank' });
        });

        it('should return 400 for insufficient funds', async () => {
            const testUserId = new ObjectId();
            (User.findById as jest.Mock).mockResolvedValue({
                _id: testUserId,
                balance: 50,
                save: jest.fn().mockResolvedValue(true),
            });

            const transactionData = {
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33XXX',
            };

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(400);

            expect(response.body).toEqual({ message: 'User not found or insufficient funds' });
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

            expect(response.body).toEqual({ message: 'Invalid SWIFT code' });
        });
    });

    describe('GET /transactions', () => {
        it('should retrieve all transactions for the authenticated user', async () => {
            const transactions = [
                { user: 'testUserId', amount: 100.50 },
                { user: 'testUserId', amount: 200.75 },
            ];

            mockCollection.find().toArray.mockResolvedValue(transactions);

            const response = await request(app)
                .get('/transactions')
                .expect(200);

            expect(response.body).toEqual(transactions);
            expect(mockCollection.find).toHaveBeenCalled();
        });

        it('should return 404 if no transactions are found', async () => {
            mockCollection.find().toArray.mockResolvedValue([]);

            const response = await request(app)
                .get('/transactions')
                .expect(404);

            expect(response.body).toEqual({ message: 'No transactions found' });
        });
    });
});
