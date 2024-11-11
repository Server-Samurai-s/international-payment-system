import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

//--------------------------------------------------------------------------------------------------------//

// Extend the Request interface to include userId
export interface AuthenticatedRequest extends Request {
    userId?: string;
}

// Middleware to authenticate JWT
export const authenticateUser = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
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

        const jwtSecret = process.env.JWT_SECRET;
        
        if (!jwtSecret) {
            console.error("JWT_SECRET is missing in environment variables.");
            res.status(500).json({ message: "Server configuration error" });
            return;
        }

        try {
            const decoded = jwt.verify(token, jwtSecret) as { userId: string };
            req.userId = decoded.userId;
            
            if (process.env.NODE_ENV !== 'production') {
                console.log("Authenticated userId:", req.userId);
            }
            
            next();
        } catch (jwtError) {
            console.error('Token verification failed:', jwtError);
            res.status(403).json({ 
                message: 'Invalid or expired token',
                error: process.env.NODE_ENV === 'development' ? (jwtError as Error).message : undefined
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};//------------------------------------------END OF FILE---------------------------------------------------//
