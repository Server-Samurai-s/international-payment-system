import request from 'supertest'; // Import supertest for HTTP assertions
import express from 'express'; // Import express framework for routing
import { User } from '../models/user'; // Import the User model for user-related operations
import userRoutes from './user.routes'; // Import user routes for handling user-related endpoints

//--------------------------------------------------------------------------------------------------------//

const app = express(); // Initialize an Express application
app.use(express.json()); // Enable JSON request body parsing
app.use('/api/users', userRoutes); // Mount user routes under the /api/users endpoint

//--------------------------------------------------------------------------------------------------------//

// Mock the User model to avoid actual database operations during tests
jest.mock('../models/user');

//--------------------------------------------------------------------------------------------------------//

// Use supertest agent to maintain a persistent connection to the app
const agent = request.agent(app);

//--------------------------------------------------------------------------------------------------------//

describe('User Routes', () => { // Group test cases for user routes
    // Use fake timers to clear any pending timers before each test
    beforeEach(() => {
        jest.useFakeTimers(); // Enable fake timers
        jest.clearAllMocks(); // Clear mocks to reset state before each test
    });

//--------------------------------------------------------------------------------------------------------//

    // Ensure all timers are cleared after each test
    afterEach(() => {
        jest.runOnlyPendingTimers(); // Run all pending timers to avoid leakage
        jest.useRealTimers(); // Reset to real timers
    });

//--------------------------------------------------------------------------------------------------------//

    describe('POST /signup', () => { // Group tests for the signup route
        it('should return 400 if any required field is missing', async () => {
            const response = await agent
                .post('/api/users/signup') // Make a POST request to the signup endpoint
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password123',
                    accountNumber: '12345678',
                });

            expect(response.status).toBe(400); // Expect a 400 Bad Request response
            expect(response.body.message).toBe('All fields are required'); // Check the error message
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 400 if passwords do not match', async () => {
            const response = await agent
                .post('/api/users/signup') // Make a POST request to the signup endpoint
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password456', // Mismatching passwords
                    accountNumber: '12345678',
                    idNumber: '87654321',
                });

            expect(response.status).toBe(400); // Expect a 400 Bad Request response
            expect(response.body.message).toBe('Passwords do not match'); // Check the error message
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 409 if user already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce({}); // Mock an existing user

            const response = await agent
                .post('/api/users/signup') // Make a POST request to the signup endpoint
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password123',
                    accountNumber: '12345678',
                    idNumber: '87654321',
                });

            expect(response.status).toBe(409); // Expect a 409 Conflict response
            expect(response.body.message).toBe('User with this email already exists'); // Check the error message
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 201 and token if user is created successfully', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce(null); // No user found
            (User.prototype.save as jest.Mock).mockResolvedValueOnce({}); // Successful save

            const response = await agent
                .post('/api/users/signup') // Make a POST request to the signup endpoint
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password123',
                    accountNumber: '12345678',
                    idNumber: '87654321',
                });

            expect(response.status).toBe(201); // Expect a 201 Created response
            expect(response.body.message).toBe('User registered successfully'); // Check the success message
            expect(response.body.token).toBeDefined(); // Ensure the token is included in the response
        });
    });

//--------------------------------------------------------------------------------------------------------//

    describe('POST /login', () => { // Group tests for the login route
        it('should return 401 if user is not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce(null); // No user found

            const response = await agent
                .post('/api/users/login') // Make a POST request to the login endpoint
                .send({
                    identifier: 'johndoe',
                    password: 'password123',
                });

            expect(response.status).toBe(401); // Expect a 401 Unauthorized response
            expect(response.body.message).toBe('Authentication failed: User not found'); // Check the error message
        });

        it('should return 401 if password is incorrect', async () => {
            const mockUser = {
                comparePassword: jest.fn().mockResolvedValueOnce(false), // Incorrect password
            };
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser); // Mock user found

            const response = await agent
                .post('/api/users/login') // Make a POST request to the login endpoint
                .send({
                    identifier: 'johndoe',
                    password: 'wrongpassword', // Incorrect password
                });

            expect(response.status).toBe(401); // Expect a 401 Unauthorized response
            expect(response.body.message).toBe('Authentication failed: Incorrect password'); // Check the error message
        });

//--------------------------------------------------------------------------------------------------------//

        it('should return 200 and token if login is successful', async () => {
            const mockUser = {
                _id: 'userId', // Mock user ID
                username: 'johndoe',
                accountNumber: '12345678',
                firstName: 'John',
                comparePassword: jest.fn().mockResolvedValueOnce(true), // Correct password
            };
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser); // Mock user found

            const response = await agent
                .post('/api/users/login') // Make a POST request to the login endpoint
                .send({
                    identifier: 'johndoe',
                    password: 'password123',
                });

            expect(response.status).toBe(200); // Expect a 200 OK response
            expect(response.body.message).toBe('Authentication successful'); // Check the success message
            expect(response.body.token).toBeDefined(); // Ensure the token is included in the response
            expect(response.body.userId).toBe(mockUser._id); // Check the user ID
            expect(response.body.username).toBe(mockUser.username); // Check the username
            expect(response.body.accountNumber).toBe(mockUser.accountNumber); // Check the account number
            expect(response.body.firstName).toBe(mockUser.firstName); // Check the first name
        });
    });
});//------------------------------------------END OF FILE---------------------------------------------------//
