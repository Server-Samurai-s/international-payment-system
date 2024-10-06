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
        const { firstName, lastName, emailAddress, username, password, accountNumber, idNumber } = req.body;

        // Validate that all required fields are provided
        if (!firstName || !lastName || !emailAddress || !username || !password || !accountNumber || !idNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const newDocument = {
            firstName,
            lastName,
            emailAddress,
            username,
            password: hashedPassword,
            accountNumber,
            idNumber,
        };

        // Access the users collection and insert the new user document
        const collection = req.app.locals.db.collection("users");
        const result = await collection.insertOne(newDocument);

        res.status(201).json({ result });
        return;
    } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Signup failed" });
        return;
    }
});

// Login Route
router.post("/login", bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        const collection = req.app.locals.db.collection("users");
        const user = await collection.findOne({ username });

        if (!user) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }

        // Authentication successful
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || '', { expiresIn: "1h" });

        res.status(200).json({
            message: "Authentication successful",
            token,
            username: user.username
        });
        return;
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ message: "Login failed" });
        return;
    }
});

export default router;
