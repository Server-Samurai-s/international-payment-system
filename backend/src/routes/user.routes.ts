import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);

// Signup Route
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, emailAddress, username, password, confirmPassword, accountNumber, idNumber } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !emailAddress || !username || !password || !confirmPassword || !accountNumber || !idNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Validate if password matches confirmation
        if (password !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }

        // Check if the user already exists
        const collection = req.app.locals.db.collection("users");
        const existingUser = await collection.findOne({ emailAddress });

        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = {
            firstName,
            lastName,
            emailAddress,
            username,
            password: hashedPassword, // Store hashed password
            accountNumber,
            idNumber,
            createdAt: new Date(),
        };

        // Insert the new user into the "users" collection
        const result = await collection.insertOne(newUser);

        res.status(201).json({ message: "User registered successfully", result });
        return;
    } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Signup failed" });
        return;
    }
});

// Login Route
router.post("/login", bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
    const { identifier, password } = req.body;

    // Input validation
    if (!identifier || !password) {
        res.status(400).json({ message: "Username/Account Number and Password are required" });
        return;
    }

    try {
        const collection = req.app.locals.db.collection("users");

        // Find the user by either username or accountNumber
        const user = await collection.findOne({
            $or: [{ username: identifier }, { accountNumber: identifier }],
        });

        if (!user) {
            console.error("User not found for identifier:", identifier);
            res.status(401).json({ message: "Username/Account Number not found" });
            return;
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.error("Incorrect password for identifier:", identifier);
            res.status(401).json({ message: "Incorrect password" });
            return;
        }

        // Authentication successful
        const token = jwt.sign(
            { username: user.username, accountNumber: user.accountNumber },
            process.env.JWT_SECRET || '',
            { expiresIn: "1h" }
        );

        // Send response with the token and user details
        res.status(200).json({
            message: "Authentication successful",
            token,
            username: user.username,
            accountNumber: user.accountNumber,
        });
        return;
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ message: "Login failed" });
        return;
    }
});

export default router;
