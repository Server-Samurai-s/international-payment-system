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
        const { name, password } = req.body;

        if (!name || !password) {
            res.status(400).json({ message: "Name and password are required" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const newDocument = {
            name,
            password: hashedPassword,
        };

        // Access the users collection and insert the new user document
        const collection = req.app.locals.db.collection("users");
        const result = await collection.insertOne(newDocument);

        res.status(201).json({ message: "User registered successfully", result });
        return;
    } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Signup failed" });
        return;
    }
});

// Login Route remains unchanged
router.post("/login", bruteforce.prevent, async (req: Request, res: Response): Promise<void> => {
    const { name, password } = req.body;

    try {
        const collection = req.app.locals.db.collection("users");
        const user = await collection.findOne({ name });

        if (!user) {
            res.status(401).json({ message: "Authentication failed: User not found" });
            return;
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({ message: "Authentication failed: Incorrect password" });
            return;
        }

        // Authentication successful
        const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET || '', { expiresIn: "1h" });

        // Send response with the token and user details
        res.status(200).json({
            userId: user._id,
            message: "Authentication successful",
            token,
            name: user.name
        });
        return;
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ message: "Login failed" });
        return;
    }
});


export default router;
