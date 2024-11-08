import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Employee from '../models/employee';
import { EmployeeRole } from '../models/employee';

interface EmployeeAuthRequest extends Request {
  employeeId?: string;
  role?: EmployeeRole;
}

export const employeeAuth = async (req: EmployeeAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { employeeId: string };
    const employee = await Employee.findOne({ employeeId: decoded.employeeId });

    if (!employee) {
      throw new Error();
    }

    req.employeeId = employee.employeeId;
    req.role = employee.role;
    next();
  } catch (error) {
    console.error('Error authenticating employee:', error);
    res.status(401).json({ message: 'Please authenticate as an employee.' });
  }
};
