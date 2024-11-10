import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ExpressBrute from 'express-brute';
import dotenv from 'dotenv';
import { User } from '../models/user';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth';

dotenv.config();

const router = express.Router();

// Configure brute-force protection using memory store
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);

// Signup Route for user registration
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, emailAddress, username, password, confirmPassword, accountNumber, idNumber } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !emailAddress || !username || !password || !confirmPassword || !accountNumber || !idNumber) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Check if user already exists based on email address
    const existingUserByEmail = await User.findOne({ emailAddress });
    if (existingUserByEmail) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Check if account number already exists
    const existingUserByAccountNumber = await User.findOne({ accountNumber });
    if (existingUserByAccountNumber) {
      res.status(409).json({ message: 'Account number already exists' });
      return;
    }

    // Create a new user with the provided data
    const newUser = new User({
      firstName,
      lastName,
      emailAddress,
      username,
      password,
      accountNumber,
      idNumber,
      balance: 10000, // Set initial balance
    });

    // Hash the user's password before saving it to the database
    await newUser.hashPassword();
    await newUser.save();

    // Generate a JWT token for the newly registered user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    // Return success response with token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login Route for user authentication
router.post('/login', bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    // Find user by username or account number for authentication
    const user = await User.findOne({
      $or: [{ username: identifier }, { accountNumber: identifier }],
    });

    // If user is not found, return authentication failure
    if (!user) {
      res.status(401).json({ message: 'Authentication failed: User not found' });
      return;
    }

    // Validate the provided password with the stored hashed password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Authentication failed: Incorrect password' });
      return;
    }

    // Generate a JWT token with user details
    const token = jwt.sign(
      { userId: user._id, username: user.username, accountNumber: user.accountNumber },
      process.env.JWT_SECRET || '',
      { expiresIn: '1h' }
    );

    // Return success response with user data and JWT token
    res.status(200).json({
      userId: user._id,
      message: 'Authentication successful',
      token,
      firstName: user.firstName,
      username: user.username,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/balance', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching balance for user ID:', req.userId);

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found for ID:', req.userId);
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log('User found:', user);
    res.status(200).json({ balance: user.balance, accountNumber: user.accountNumber });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

export default router;