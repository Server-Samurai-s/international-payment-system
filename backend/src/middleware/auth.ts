import jwt from 'jsonwebtoken'; 
import { Request, Response, NextFunction } from 'express';

//--------------------------------------------------------------------------------------------------------//

// Extend the Request interface to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string; // Optional userId field for requests that have an authenticated user
}

// Middleware to authenticate JWT
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Retrieve the Authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is missing
    if (!authHeader) {
        // Respond with 401 Unauthorized if no Authorization header is present
        res.status(401).json({ message: 'Authorization header required' });
        return; // End function execution to prevent further code from running
    }

    // Extract the token part from the Authorization header (assumed to be in "Bearer <token>" format)
    const token = authHeader.split(' ')[1];

    // Check if the token is missing after splitting the header
    if (!token) {
        // Respond with 401 Unauthorized if no token is found
        res.status(401).json({ message: 'Authorization token required' });
        return; // End function execution
    }

    try {
        // Verify the JWT using the secret stored in the environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
        
        // Assign the decoded userId to the request object for later use
        req.userId = decoded.userId;

        // Log the authenticated userId for debugging purposes
        console.log("Authenticated userId:", req.userId);

        // Move to the next middleware or request handler
        next();
    } catch (error) {
        // Log the error if token verification fails
        console.error('Token verification failed:', error);
        
        // Respond with 403 Forbidden if the token is invalid or expired
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};//------------------------------------------END OF FILE---------------------------------------------------//
