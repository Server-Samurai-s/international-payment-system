import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import routes
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";

dotenv.config(); // Load environment variables

const app = express(); // Export this instance

// MongoDB connection
mongoose
    .connect(process.env.ATLAS_URI || '')
    .then((connection) => {
        app.locals.db = connection.connection.db;
        console.log('MongoDB connected');
    })
    .catch((error) => {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1); // Exit if unable to connect to MongoDB
    });

// Set up CORS options
const corsOptions = {
    origin: "https://international-payment-system.vercel.app", // Only allow requests from this origin
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow credentials for cross-origin requests
};

app.use(cors(corsOptions));

// Debugging middleware to confirm CORS headers are set correctly
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://international-payment-system.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    console.log(`CORS headers set for request to: ${req.path}`);
    next();
});

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use("/transactions", transactionRoutes);
app.use("/user", userRoutes);

// Export `app` for Vercel deployment (no HTTPS)
export default app;

// Conditionally start an HTTPS server for local development
if (process.env.NODE_ENV !== "production") {
    const options = {
        key: fs.readFileSync('./src/keys/mongodb-key.pem'),
        cert: fs.readFileSync('./src/keys/certificate.pem')
    };

    https.createServer(options, app).listen(process.env.PORT || 3001, () => {
        console.log(`Server running locally with HTTPS on port ${process.env.PORT || 3001}`);
    });
} else {
    // Start an HTTP server if NODE_ENV is set to production (for Vercel compatibility)
    app.listen(process.env.PORT || 3001, () => {
        console.log(`Server running on port ${process.env.PORT || 3001}`);
    });
}
