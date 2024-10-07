import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ExpressBrute from 'express-brute';
import dotenv from 'dotenv';
import { User } from '../models/user';

dotenv.config();

const router = express.Router();

// Configure brute-force protection
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);

// Signup Route
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

    // Check if user already exists
    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Create and save new user with default account balance
    const newUser = new User({
      firstName,
      lastName,
      emailAddress,
      username,
      password,
      accountNumber,
      idNumber,
      // `accountBalance` will default to 10000 due to the schema definition
    });

    // Hash the password before saving
    await newUser.hashPassword();
    await newUser.save();

    // Generate JWT token with basic user details
    const token = jwt.sign({ userId: newUser._id, firstName: newUser.firstName, username: newUser.username }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    // Return success response with token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login Route
router.post('/login', bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    // Find user by username or account number
    const user = await User.findOne({
      $or: [{ username: identifier }, { accountNumber: identifier }],
    });

    if (!user) {
      res.status(401).json({ message: 'Authentication failed: User not found' });
      return;
    }

    // Validate password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Authentication failed: Incorrect password' });
      return;
    }

    // Generate JWT token with essential user details
    const token = jwt.sign(
      { userId: user._id, firstName: user.firstName, username: user.username },
      process.env.JWT_SECRET || '',
      { expiresIn: '1h' }
    );

    // Return success response with token and additional user details (not in JWT)
    res.status(200).json({
      userId: user._id,
      token,
      firstName: user.firstName,
      accountNumber: user.accountNumber,
      accountBalance: user.accountBalance, // Include account balance in response, not JWT
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
