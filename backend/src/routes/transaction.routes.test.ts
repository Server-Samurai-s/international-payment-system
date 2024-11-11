import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import transactionRoutes from './transaction.routes';
import jwt from 'jsonwebtoken';
import { ITransactionDocument } from '../models/transaction.model';

// Import the mocked TransactionModel
const { TransactionModel } = jest.requireMock('../models/transaction.model');

const generateTestToken = () => {
    return jwt.sign(
        { userId: new mongoose.Types.ObjectId().toString() },
        'test-secret',
        { expiresIn: '1h' }
    );
};

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

// Define types for mock data
interface MockSession {
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    abortTransaction: jest.Mock;
    endSession: jest.Mock;
}

interface MockTransactionModelData {
    save: jest.Mock;
    [key: string]: jest.Mock | unknown;
}

// Mock mongoose first
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: jest.fn().mockImplementation((): MockSession => ({
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

// Mock TransactionModel
jest.mock('../models/transaction.model', () => {
    class MockTransactionModel {
        constructor(data: Partial<ITransactionDocument>) {
            return {
                ...data,
                save: jest.fn().mockResolvedValue(data)
            };
        }

        static find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        static create = jest.fn().mockImplementation((data: Partial<ITransactionDocument>) => 
            new MockTransactionModel(data)
        );
    }

    return {
        TransactionModel: MockTransactionModel,
        MockTransactionModel
    };
});

// Define the specific function type for TransactionModel
type TransactionModelConstructor = (data: Partial<ITransactionDocument>) => MockTransactionModelData;

// Update the global augmentation
(global as { TransactionModel?: TransactionModelConstructor }).TransactionModel = function(data: Partial<ITransactionDocument>): MockTransactionModelData {
    return {
        ...data,
        save: jest.fn().mockResolvedValue(true)
    };
};

// Mock auth middleware with proper types
interface AuthRequest extends express.Request {
    userId?: string;
}

jest.mock('../middleware/auth', () => ({
    authenticateUser: (req: AuthRequest, _res: express.Response, next: express.NextFunction) => {
        req.userId = new mongoose.Types.ObjectId().toString();
        next();
    }
}));

// Rest of the test file remains the same until the GET /transactions test
describe('GET /transactions', () => {
    it('should retrieve all transactions for the authenticated user', async () => {
        const token = generateTestToken();
        const mockTransaction: Partial<ITransactionDocument> = {
            user: new mongoose.Types.ObjectId().toString(),
            recipientId: new mongoose.Types.ObjectId().toString(),
            recipientName: 'Test Recipient',
            recipientBank: 'Test Bank',
            accountNumber: '123456789012',
            amount: 100.50,
            swiftCode: 'TESTUS33XXX',
            transactionDate: new Date().toISOString(),
            status: 'completed',
            senderName: 'John Doe'
        };

        // Use TransactionModel instead of MockTransactionModel
        jest.spyOn(TransactionModel, 'find').mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue([mockTransaction])
        }));

        const response = await request(app)
            .get('/transactions')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body).toEqual([mockTransaction]);
    });
});


