import https from "https"; // For creating a secure server
import fs from "fs"; // For handling SSL certificate files
import express, { Request, Response, NextFunction } from "express"; // Express server and types
import cors from "cors"; // CORS handling
import mongoose from "mongoose"; // MongoDB ODM
import dotenv from "dotenv"; // Environment variable management
import helmet from "helmet"; // Security headers
import cookieSession from "cookie-session"; // Session management
import xss from "xss-clean"; // XSS protection

// Import routes
import transactionRoutes from "./routes/transaction.routes";
import userRoutes from "./routes/user.routes";

// Load environment variables
dotenv.config();

// Initialize Express app and port setup
const app = express();
const PORT = process.env.PORT || 3001;

// HTTPS options
let sslOptions: https.ServerOptions;
try {
  sslOptions = {
    key: fs.readFileSync('./src/keys/mongodb-key.pem'), // SSL key
    cert: fs.readFileSync('./src/keys/certificate.pem'), // SSL certificate
  };
} catch (err) {
  console.error('Error reading SSL certificate or key:', err);
  process.exit(1);
}

// MongoDB connection
const dbURI = process.env.ATLAS_URI;
if (!dbURI) {
  console.error('MongoDB URI is missing in environment variables.');
  process.exit(1);
}
mongoose.connect(dbURI)
  .then((connection) => {
    app.locals.db = connection.connection.db;
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  });

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(xss());

// Session management with cookies
app.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET || "default_secret_key"],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// Apply security headers for HSTS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Routes
app.use("/transactions", transactionRoutes);
app.use("/user", userRoutes);

// Create and start HTTPS server
const server = https.createServer(sslOptions, app);
server.listen(PORT, () => {
  console.log(`Server is running securely on port: ${PORT}`);
});

export { app, server };
