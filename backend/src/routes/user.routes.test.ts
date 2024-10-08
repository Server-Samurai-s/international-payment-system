import request from 'supertest';
import express from 'express';
import { User } from '../models/user';  // Mocked user model
import userRoutes from './user.routes'; // Your user routes

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock the User model
jest.mock('../models/user');

// Optional: Jest timeout if needed
jest.setTimeout(10000);  // Adjust this based on your test suite needs

describe('User Routes', () => {
    // Clean up mocks and timers before each test
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();  // In case there are timers
    });

    // If you need to close a server, you can handle it here (usually unnecessary for supertest)
    afterAll(() => {
        // You can perform additional cleanup if needed (e.g., closing DB connections)
        jest.restoreAllMocks();  // Restore original behavior of all mocked functions
    });

    describe('POST /signup', () => {
        it('should return 400 if any required field is missing', async () => {
            const response = await request(app)
                .post('/api/users/signup')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password123',
                    accountNumber: '12345678',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('All fields are required');
        });

        it('should return 400 if passwords do not match', async () => {
            const response = await request(app)
                .post('/api/users/signup')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john.doe@example.com',
                    username: 'johndoe',
                    password: 'password123',
                    confirmPassword: 'password456',  // Mismatching passwords
                    accountNumber: '12345678',
                    idNumber: '87654321',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Passwords do not match');
        });

        it('should return 409 if user already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce({});  // Mock an existing user

            const response = await request(app)
                .post('/api/users/signup')
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

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('User with this email already exists');
        });

        it('should return 201 and token if user is created successfully', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce(null);  // No user found
            (User.prototype.save as jest.Mock).mockResolvedValueOnce({});  // Successful save

            const response = await request(app)
                .post('/api/users/signup')
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

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.token).toBeDefined();  // Check for the token
        });
    });

    describe('POST /login', () => {
        it('should return 401 if user is not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce(null);  // No user found

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    identifier: 'johndoe',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Authentication failed: User not found');
        });

        it('should return 401 if password is incorrect', async () => {
            const mockUser = {
                comparePassword: jest.fn().mockResolvedValueOnce(false),  // Incorrect password
            };
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    identifier: 'johndoe',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Authentication failed: Incorrect password');
        });

        it('should return 200 and token if login is successful', async () => {
            const mockUser = {
                _id: 'userId',
                username: 'johndoe',
                accountNumber: '12345678',
                firstName: 'John',
                comparePassword: jest.fn().mockResolvedValueOnce(true),  // Correct password
            };
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    identifier: 'johndoe',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Authentication successful');
            expect(response.body.token).toBeDefined();  // Check for the token
            expect(response.body.userId).toBe(mockUser._id);
            expect(response.body.username).toBe(mockUser.username);
            expect(response.body.accountNumber).toBe(mockUser.accountNumber);
            expect(response.body.firstName).toBe(mockUser.firstName);
        });
    });
});
