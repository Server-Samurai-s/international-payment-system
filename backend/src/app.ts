import https from "https"; // Import https module for creating a secure server
import fs from "fs"; // Import file system module to read SSL certificate files
import express, { Request, Response, NextFunction } from "express"; // Import express and types for TypeScript
import cors from "cors"; // Import CORS for handling cross-origin requests
import mongoose from "mongoose"; // Import mongoose to interact with MongoDB
import dotenv from "dotenv"; // Import dotenv to load environment variables

//--------------------------------------------------------------------------------------------------------//

// Import routes for transactions and users
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";

//--------------------------------------------------------------------------------------------------------//

// Load environment variables from .env file
dotenv.config(); // Initialize dotenv to use environment variables

//--------------------------------------------------------------------------------------------------------//

// Set the port from environment variables or default to 3001
const PORT = process.env.PORT || 3001;
const app = express(); // Initialize the express application

//--------------------------------------------------------------------------------------------------------//

// HTTPS options with paths to the SSL certificate and key
let sslOptions: https.ServerOptions;
try {
  sslOptions = {
    key: fs.readFileSync('./src/keys/mongodb-key.pem'), // Read private key for SSL
    cert: fs.readFileSync('./src/keys/certificate.pem'), // Read certificate for SSL
  };
} catch (err) {
  console.error('Error reading SSL certificate or key:', err);
  process.exit(1); // Exit if SSL files are not available
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
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse incoming JSON requests with a size limit of 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded data with a size limit of 10MB

//--------------------------------------------------------------------------------------------------------//

// Manually set CORS headers (redundant if `cors()` is already being used, but included for clarity)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  next();
});

//--------------------------------------------------------------------------------------------------------//

// Define routes for handling transactions and users
app.use("/transactions", transactionRoutes); // Use transaction routes for /transactions endpoint
app.use("/user", userRoutes); // Use user routes for /user endpoint

//--------------------------------------------------------------------------------------------------------//

// Create an HTTPS server using the SSL options and express app
const server = https.createServer(sslOptions, app);

//--------------------------------------------------------------------------------------------------------//

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running securely on port: ${PORT}`); // Log when the server is running
});


export {app, server}; // Export the express app for testing purposes
//------------------------------------------END OF FILE---------------------------------------------------//
