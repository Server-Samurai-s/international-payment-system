import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string; // Optional userId field for authenticated requests
}

// Middleware to authenticate JWT
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is missing
  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header required' });
    return; // Ensure no further code is executed
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Authorization token required' });
    return; // Ensure no further code is executed
  }

  try {
    // Verify JWT with the secret key; ensure jwtSecret is defined in the environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is missing in environment variables.");
      res.status(500).json({ message: "Internal server error" });
      return; // Ensure no further code is executed
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    // Attach decoded userId to the request object
    req.userId = decoded.userId;

    console.log("Authenticated userId:", req.userId); // Debugging information

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
    return; // Ensure no further code is executed
  }
};
