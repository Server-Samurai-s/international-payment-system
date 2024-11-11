import express, { Request, Response } from 'express'; // Import express and types for Request and Response
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for creating and verifying JWT tokens
import ExpressBrute from 'express-brute'; // Import ExpressBrute for brute-force protection
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import { User } from '../models/user'; // Import the User model for interacting with the database
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth';
import { decryptAccountNumber, encryptAccountNumber } from '../utils/encryption';

//--------------------------------------------------------------------------------------------------------//

dotenv.config(); // Load environment variables from .env file

//--------------------------------------------------------------------------------------------------------//

const router = express.Router(); // Initialize express router

//--------------------------------------------------------------------------------------------------------//

// Configure brute-force protection using memory store
const store = new ExpressBrute.MemoryStore(); // Store brute force attempt data in memory
const bruteforce = new ExpressBrute(store); // Initialize brute-force protection

//--------------------------------------------------------------------------------------------------------//

// Signup Route for user registration
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, emailAddress, username, password, confirmPassword, accountNumber, idNumber } = req.body; // Destructure signup form data

  try {
    // Validate required fields
    if (!firstName || !lastName || !emailAddress || !username || !password || !confirmPassword || !accountNumber || !idNumber) {
      res.status(400).json({ message: 'All fields are required' }); // Return error if any field is missing
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' }); // Return error if passwords do not match
      return;
    }

    // Check if user already exists based on email address
    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' }); // Return conflict error if user exists
      return;
    }

    const encryptedAccountNumber = encryptAccountNumber(accountNumber);

    // Create a new user with the provided data
    const newUser = new User({
      firstName,
      lastName,
      email: emailAddress,
      username,
      password,
      accountNumber: encryptedAccountNumber,
      idNumber,
      balance: 10000, // Set initial balance
    });

    // The password will be automatically hashed by the pre-save middleware
    await newUser.save(); // Save the new user to the database  

    // Generate a JWT token for the newly registered user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    // Return success response with token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Signup error:', error); // Log any errors during signup process
    res.status(500).json({ message: 'Signup failed' }); // Return generic error message
  }
});

//--------------------------------------------------------------------------------------------------------//

// Login Route for user authentication
router.post('/login', bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body; // Destructure login credentials from request body
  console.log(identifier, password);

  try {
    // Find user by username or account number for authentication
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { accountNumber: identifier.startsWith('enc:') ? identifier : encryptAccountNumber(identifier) }
      ]
    });

    // If user is not found, return authentication failure
    if (!user) {
      res.status(401).json({ message: 'Authentication failed: User not found' });
      return;
    }

    // Validate the provided password with the stored hashed password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Authentication failed: Incorrect password' }); // Return error if password is incorrect
      return;
    }

    // Generate a JWT token with user details
    const token = jwt.sign(
      { userId: user._id, username: user.username, accountNumber: user.accountNumber },
      process.env.JWT_SECRET || '', // Sign the token with a secret from environment variables
      { expiresIn: '1h' } // Set token expiry time to 1 hour
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
    console.error('Login error:', error); // Log any errors during login process
    res.status(500).json({ message: 'Login failed' }); // Return generic error message
  }
});

//--------------------------------------------------------------------------------------------------------//

router.get('/balance', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ 
            balance: user.balance,
            accountNumber: decryptAccountNumber(user.accountNumber)
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Failed to fetch user data' });
    }
});

//--------------------------------------------------------------------------------------------------------//

export default router; // Export the router for use in other parts of the application

//------------------------------------------END OF FILE---------------------------------------------------//
