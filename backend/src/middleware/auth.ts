import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define your own request interface here to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization; // Get the Authorization header

    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header required' });
        return;  // Stop further execution if no token
    }

    // Extract the token from 'Bearer <token>' format
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;  // Stop further execution if no token
    }

    try {
        // Verify the token and extract userId from the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };

        // Attach the extracted userId to the request object
        req.userId = decoded.userId;

        // Log for debugging (optional)
        console.log("Authenticated userId:", req.userId);

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
        return;  // Stop further execution if token is invalid
    }
};
