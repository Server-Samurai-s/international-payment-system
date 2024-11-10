import https from "https"; // Import https module for creating a secure server
import fs from "fs"; // Import file system module to read SSL certificate files
import express, { Request, Response, NextFunction } from "express"; // Import express and types for TypeScript
import cors from "cors"; // Import CORS for handling cross-origin requests
import mongoose from "mongoose"; // Import mongoose to interact with MongoDB
import dotenv from "dotenv"; // Import dotenv to load environment variables
import http from "http";
import helmet from "helmet";
import cookieSession from "cookie-session";
import jwt from "jsonwebtoken";
import { User } from "./models/user";
// Import routes for transactions and users
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";
import employeeRoutes from "./routes/employee.routes";
import xssClean from 'xss-clean';
//--------------------------------------------------------------------------------------------------------//

// Load environment variables from .env file
dotenv.config(); // Initialize dotenv to use environment variables

//--------------------------------------------------------------------------------------------------------//


// Set the port from environment variables or default to 3001
const PORT = process.env.PORT || 3001;
const app = express(); // Initialize the express application

//--------------------------------------------------------------------------------------------------------//

// Add production environment check
const isProduction = process.env.NODE_ENV === "production";

// Update required environment variables
const jwtSecret = process.env.JWT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;

// Update SSL options with error handling
let sslOptions: https.ServerOptions | undefined;
try {
  sslOptions = {
    key: fs.readFileSync('./src/keys/ca/server.key'),
    cert: fs.readFileSync('./src/keys/ca/server.crt'),
    ca: fs.readFileSync('./src/keys/ca/rootCA.pem')
  };
} catch (err) {
  console.warn("SSL certificates not found; defaulting to HTTP in development. Error:", err);
  sslOptions = undefined;
}

//--------------------------------------------------------------------------------------------------------//

// MongoDB connection setup
const dbURI = process.env.ATLAS_URI;
if (!dbURI) {
  console.error('MongoDB URI is missing in environment variables.');
  process.exit(1);
}

mongoose
  .connect(dbURI) // Simply use mongoose.connect without deprecated options
  .then((connection) => {
    app.locals.db = connection.connection.db; // Store the database instance in app.locals for later use
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1); // Exit the process if unable to connect to MongoDB
  });

//--------------------------------------------------------------------------------------------------------//

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(xssClean());

// Add session management
app.use(cookieSession({
  name: "session",
  keys: [sessionSecret || 'fallback-secret'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// Add HSTS for production
if (isProduction) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
}

// Add JWT helper functions
function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret!);
  } catch {
    throw new Error("Invalid or expired token.");
  }
}

// Add protected route example
app.get("/protected", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Token is required" });
      return;
    }

    const decoded = verifyToken(token);
    res.status(200).json({ message: "Access granted", data: decoded });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Add test DB route
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({ message: "Data retrieved successfully", users });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ message: "Error retrieving data from database" });
  }
});

// Add global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

//--------------------------------------------------------------------------------------------------------//

// Define routes for handling transactions and users
app.use("/transactions", transactionRoutes); // Use transaction routes for /transactions endpoint
app.use("/user", userRoutes); // Use user routes for /user endpoint
app.use("/employee", employeeRoutes);

//--------------------------------------------------------------------------------------------------------//

// Create an HTTPS server using the SSL options and express app
const server = sslOptions 
  ? https.createServer(sslOptions, app) 
  : http.createServer(app);

//--------------------------------------------------------------------------------------------------------//

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running ${sslOptions ? "securely" : "insecurely"} on port: ${PORT}`);
});


export {app, server}; // Export the express app for testing purposes
//------------------------------------------END OF FILE---------------------------------------------------//
