// app.ts

import https from "https"; // For creating a secure server
import http from "http"; // For fallback HTTP in development
import fs from "fs"; // For handling SSL certificate files
import express, { Request, Response, NextFunction } from "express"; // Express server and types
import cors from "cors"; // CORS handling
import mongoose from "mongoose"; // MongoDB ODM
import dotenv from "dotenv"; // Environment variable management
import helmet from "helmet"; // Security headers
import cookieSession from "cookie-session"; // Session management
import jwt from "jsonwebtoken"; // JWT for authentication
import { User } from "./models/user";

const xss = require("xss-clean"); // Import XSS cleaner

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Required environment variables
const dbURI = process.env.ATLAS_URI;
const jwtSecret = process.env.JWT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;

// Verify all required environment variables are set
if (!dbURI || !jwtSecret || !sessionSecret) {
  console.error("Missing one or more critical environment variables.");
  process.exit(1);
}

// HTTPS options
let sslOptions: https.ServerOptions | undefined;
try {
  sslOptions = {
    key: fs.readFileSync('./src/keys/mongodb-key.pem'), // SSL key
    cert: fs.readFileSync('./src/keys/certificate.pem'), // SSL certificate
  };
} catch (err) {
  console.warn("SSL certificates not found; defaulting to HTTP in development. Error:", err);
}

// MongoDB connection
mongoose.connect(dbURI)
  .then((connection) => {
    app.locals.db = connection.connection.db;
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  });

// Middleware setup
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Restrict CORS in production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet()); // Adds security headers
app.use(xss()); // Sanitizes input to prevent XSS attacks

// Session management with cookie-session
app.use(cookieSession({
  name: "session",
  keys: [sessionSecret],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// Apply HSTS for production
if (isProduction) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
}

// Import and set up routes
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";
app.use("/transactions", transactionRoutes);
app.use("/user", userRoutes);

// JWT Authentication Helper Functions
function generateToken(userId: string): string {
  return jwt.sign({ userId }, jwtSecret!, { expiresIn: "1h" });
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret!);
  } catch (error) {
    throw new Error("Invalid or expired token.");
  }
}

// Example usage in a route for protected content
app.get("/protected", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const decoded = verifyToken(token);
    res.status(200).json({ message: "Access granted", data: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Test MongoDB connection with a simple route
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Retrieve all users
    res.status(200).json({ message: "Data retrieved successfully", users });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ message: "Error retrieving data from database" });
  }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

// HTTPS or HTTP server
const server = sslOptions 
  ? https.createServer(sslOptions, app) 
  : http.createServer(app); // Use HTTP if no SSL certificates are provided

server.listen(PORT, () => {
  console.log(`Server is running ${sslOptions ? "securely" : "insecurely"} on port: ${PORT}`);
});

export { app, server };
