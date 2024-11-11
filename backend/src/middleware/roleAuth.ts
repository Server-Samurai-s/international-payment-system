import { Request, Response, NextFunction } from 'express';
import { EmployeeRole } from '../models/employee';

interface RoleAuthRequest extends Request {
    employeeId?: string;
    role?: EmployeeRole;
}

export const requireRole = (allowedRoles: EmployeeRole[]) => {
    return async (
        req: RoleAuthRequest, 
        res: Response, 
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.role) {
                res.status(403).json({ 
                    message: 'Access denied: Role not found',
                    error: process.env.NODE_ENV === 'development' ? 'No role attached to request' : undefined
                });
                return;
            }

            if (!allowedRoles.includes(req.role)) {
                if (process.env.NODE_ENV !== 'production') {
                    console.log("Access denied for role:", req.role, "Required roles:", allowedRoles);
                }
                
                res.status(403).json({ 
                    message: 'Access denied: Insufficient privileges',
                    error: process.env.NODE_ENV === 'development' 
                        ? `Role ${req.role} not in allowed roles: ${allowedRoles.join(', ')}` 
                        : undefined
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Role verification error:', error);
            res.status(500).json({ 
                message: 'Server error',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    };
};
