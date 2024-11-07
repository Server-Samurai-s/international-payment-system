import { Request, Response, NextFunction } from 'express';
import { EmployeeRole } from '../models/employee';

interface RoleAuthRequest extends Request {
    employeeId?: string;
    role?: EmployeeRole;
}

export const requireRole = (allowedRoles: EmployeeRole[]) => {
    return async (req: RoleAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.role) {
                res.status(403).json({ message: 'Access denied: Role not found' });
                return;
            }

            if (!allowedRoles.includes(req.role)) {
                res.status(403).json({ message: 'Access denied: Insufficient privileges' });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    };
};
