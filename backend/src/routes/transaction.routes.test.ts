import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import transactionRoutes from './transaction.routes';
import { User } from '../models/user';  // Adjust the path for the model
import { Transaction, ITransaction } from '../models/transaction'; // Adjust the path as needed
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

// Define a consistent testUserId
const testUserId = new mongoose.Types.ObjectId();

// Mock User model to avoid real database calls
jest.mock('../models/user', () => ({
    User: {
        findById: jest.fn(),
    },
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
    authenticateUser: jest.fn((req, res, next) => {
        req.userId = testUserId; // Use consistent testUserId
        next();
    }),
}));

let mongoServer: MongoMemoryServer | undefined;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Clear the database before each test
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

            expect(response.body).toHaveProperty('message', 'Transaction successful');
            expect(response.body).toHaveProperty('transaction');
            expect(response.body).toHaveProperty('newBalance', initialBalance - transactionAmount);
        }, 20000); // Extend timeout if needed
    });

    describe('GET /transactions', () => {
        it('should retrieve all transactions for the authenticated user', async () => {
            // Mock transactions data with all required fields
            const transactions: ITransaction[] = [
                new Transaction({
                    user: testUserId,
                    amount: 100.50,
                    recipientName: 'Recipient One',
                    recipientBank: 'Bank One',
                    accountNumber: '1234567890',
                    swiftCode: 'BANKONE',
                    transactionDate: new Date(),
                }),
                new Transaction({
                    user: testUserId,
                    amount: 200.75,
                    recipientName: 'Recipient Two',
                    recipientBank: 'Bank Two',
                    accountNumber: '0987654321',
                    swiftCode: 'BANKTWO',
                    transactionDate: new Date(),
                }),
            ];

            // Insert mock transactions using the model
            await Transaction.insertMany(transactions);

            // Make GET request to retrieve transactions
            const response = await request(app)
                .get('/transactions')
                .expect(200);

            // Verify that the response contains the transactions
            expect(response.body.length).toBe(2);

            // Map transactions to expected format for comparison
            const expectedTransactions = transactions.map((tx: ITransaction) => ({
                user: tx.user.toString(),
                amount: tx.amount,
                recipientName: tx.recipientName,
                recipientBank: tx.recipientBank,
                accountNumber: tx.accountNumber,
                swiftCode: tx.swiftCode,
                transactionDate: tx.transactionDate!.toISOString(),
            }));

            // Adjust the response body for comparison
            const responseTransactions = response.body.map((tx: any) => ({
                user: tx.user,
                amount: tx.amount,
                recipientName: tx.recipientName,
                recipientBank: tx.recipientBank,
                accountNumber: tx.accountNumber,
                swiftCode: tx.swiftCode,
                transactionDate: tx.transactionDate,
            }));

            expect(responseTransactions).toEqual(
                expect.arrayContaining(expectedTransactions)
            );
        });
    });
});
