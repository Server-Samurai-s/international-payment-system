import request from 'supertest';
import express from 'express';
import transactionRoutes from './transaction.routes';
import { authenticateUser } from '../middleware/auth';

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

// Mock the authenticateUser middleware
jest.mock('../middleware/auth', () => ({
    authenticateUser: jest.fn((req, res, next) => {
        req.userId = 'testUserId';
        next();
    }),
}));

// Mock the database collection
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
            const transactionData = {
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33',
            };

            mockCollection.insertOne.mockResolvedValue({ insertedId: 'testTransactionId' });

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(201);

            expect(response.body).toEqual({ insertedId: 'testTransactionId' });
            expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
                user: 'testUserId',
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: 100.50,
                swiftCode: 'TESTUS33',
            }));
        });

        it('should return 400 for invalid recipient name', async () => {
            const transactionData = {
                recipientName: 'John123',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33',
            };

            const response = await request(app)
                .post('/transactions/create')
                .send(transactionData)
                .expect(400);

            expect(response.body).toEqual({ message: 'Invalid recipient name' });
        });

        // Add more tests for other validation cases...
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
            expect(mockCollection.find).toHaveBeenCalledWith({ user: 'testUserId' });
        });

        it('should return 404 if no transactions are found', async () => {
            mockCollection.find().toArray.mockResolvedValue([]);

            const response = await request(app)
                .get('/transactions')
                .expect(404);

            expect(response.body).toEqual({ message: 'No transactions found' });
        });

        // Add more tests for error handling...
    });
});