import mongoose from 'mongoose';
import EmployeeModel from '../models/employee';
import { EmployeeRole } from '../models/employee';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI!);
        
        // Check if super admin already exists
        const existingSuperAdmin = await EmployeeModel.findOne({ role: EmployeeRole.SUPER_ADMIN });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        // Generate employee ID
        const employeeId = `EMP${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', salt);

        const superAdmin = new EmployeeModel({
            employeeId,
            firstName: 'Super',
            lastName: 'Admin',
            username: 'superadmin',
            password: hashedPassword,
            role: EmployeeRole.SUPER_ADMIN
        });

        await superAdmin.save();
        console.log('Super admin created successfully');
        console.log('Username: superadmin');
        console.log('Password: SuperAdmin123!');
        
    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createSuperAdmin(); 