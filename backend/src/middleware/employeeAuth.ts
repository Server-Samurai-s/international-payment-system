import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Employee, { EmployeeRole } from '../models/employee';

interface EmployeeAuthRequest extends Request {
    employeeId?: string;
    role?: EmployeeRole;
}

export const employeeAuth = async (
    req: EmployeeAuthRequest, 
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
            const decoded = jwt.verify(token, jwtSecret) as { employeeId: string };
            const employee = await Employee.findOne({ employeeId: decoded.employeeId });

            if (!employee) {
                res.status(401).json({ message: 'Employee not found' });
                return;
            }

            req.employeeId = employee.employeeId;
            req.role = employee.role;
            
            if (process.env.NODE_ENV !== 'production') {
                console.log("Authenticated employeeId:", req.employeeId, "Role:", req.role);
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
};
