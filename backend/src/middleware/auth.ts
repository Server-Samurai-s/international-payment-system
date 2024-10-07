import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware to authenticate JWT
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
        req.userId = decoded.userId;

        console.log("Authenticated userId:", req.userId);

        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
