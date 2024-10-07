import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import routes
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";

// Load environment variables from .env file
dotenv.config();

// Set the port
const PORT = process.env.PORT || 3001;
const app = express();

// HTTPS options for secure connection
const options = {
  key: fs.readFileSync('./src/keys/mongodb-key.pem'),
  cert: fs.readFileSync('./src/keys/certificate.pem')
};

// MongoDB connection
mongoose
  .connect(process.env.ATLAS_URI || '')
  .then((connection) => {
    app.locals.db = connection.connection.db; // Store the db instance in app.locals
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1); // Exit if unable to connect to MongoDB
  });

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Set the JSON payload limit to 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Set the URL-encoded payload limit to 10MB

// CORS header setup manually (can be redundant if using cors middleware)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use("/transactions", transactionRoutes); // Handle all routes for transactions
app.use("/user", userRoutes);  // Handle all routes for users

// Create HTTPS server
const server = https.createServer(options, app);
server.listen(PORT, () => {
  console.log(`Server is running securely on port: ${PORT}`);
});
