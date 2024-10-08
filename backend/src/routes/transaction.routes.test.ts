import request from 'supertest'; // Import the supertest library for HTTP assertions
import express from 'express'; // Import the express framework for routing
import transactionRoutes from './transaction.routes'; // Import the transaction routes

//--------------------------------------------------------------------------------------------------------//

const app = express(); // Initialize an Express application
app.use(express.json()); // Enable JSON request body parsing
app.use('/transactions', transactionRoutes); // Use the transaction routes under the /transactions endpoint

//--------------------------------------------------------------------------------------------------------//

// Mock the authenticateUser middleware
jest.mock('../middleware/auth', () => ({
    authenticateUser: jest.fn((req, res, next) => {
        req.userId = 'testUserId'; // Simulate adding userId to the request
        next(); // Call the next middleware
    }),
}));

//--------------------------------------------------------------------------------------------------------//

// Mock the database collection
const mockCollection = {
    insertOne: jest.fn(), // Mock the insertOne function
    find: jest.fn().mockReturnValue({
        toArray: jest.fn(), // Mock the toArray function of the find method
    }),
};

//--------------------------------------------------------------------------------------------------------//

// Assign the mocked collection to the app's local database
app.locals.db = {
    collection: jest.fn().mockReturnValue(mockCollection), // Mock the collection method
};
//--------------------------------------------------------------------------------------------------------//

describe('Transaction Routes', () => { // Group test cases for transaction routes
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test to ensure no state leakage
    });

//--------------------------------------------------------------------------------------------------------//

    describe('POST /transactions/create', () => { // Group tests for the create transaction route
        it('should create a new transaction with valid data', async () => { // Test for successful transaction creation
            const transactionData = { // Valid transaction data
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33',
            };

            mockCollection.insertOne.mockResolvedValue({ insertedId: 'testTransactionId' }); // Mock response for insertOne

            const response = await request(app) // Make a POST request to create a transaction
                .post('/transactions/create')
                .send(transactionData) // Send the transaction data
                .expect(201); // Expect a 201 Created response

            expect(response.body).toEqual({ insertedId: 'testTransactionId' }); // Check the response body
            expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({ // Validate the parameters for insertOne
                user: 'testUserId', // Ensure the userId is included
                recipientName: 'John Doe',
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: 100.50, // Ensure the amount is a number
                swiftCode: 'TESTUS33',
            }));
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 400 for invalid recipient name', async () => { // Test for validation failure
            const transactionData = { // Invalid transaction data
                recipientName: 'John123', // Invalid name with numbers
                recipientBank: 'Bank of Test',
                accountNumber: '123456789012',
                amount: '100.50',
                swiftCode: 'TESTUS33',
            };

            const response = await request(app) // Make a POST request with invalid data
                .post('/transactions/create')
                .send(transactionData)
                .expect(400); // Expect a 400 Bad Request response

            expect(response.body).toEqual({ message: 'Invalid recipient name' }); // Check the response message
        });
    });

//--------------------------------------------------------------------------------------------------------//

    describe('GET /transactions', () => { // Group tests for retrieving transactions
        it('should retrieve all transactions for the authenticated user', async () => { // Test for successful retrieval
            const transactions = [ // Mock transaction data
                { user: 'testUserId', amount: 100.50 },
                { user: 'testUserId', amount: 200.75 },
            ];

            mockCollection.find().toArray.mockResolvedValue(transactions); // Mock response for finding transactions

            const response = await request(app) // Make a GET request to retrieve transactions
                .get('/transactions')
                .expect(200); // Expect a 200 OK response

            expect(response.body).toEqual(transactions); // Check the response body
            expect(mockCollection.find).toHaveBeenCalledWith({ user: 'testUserId' }); // Validate the parameters for find
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 404 if no transactions are found', async () => { // Test for no transactions found
            mockCollection.find().toArray.mockResolvedValue([]); // Mock an empty response

            const response = await request(app) // Make a GET request to retrieve transactions
                .get('/transactions')
                .expect(404); // Expect a 404 Not Found response

            expect(response.body).toEqual({ message: 'No transactions found' }); // Check the response message
        });
    });
});//------------------------------------------END OF FILE---------------------------------------------------//
