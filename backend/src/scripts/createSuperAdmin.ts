import mongoose from 'mongoose';
import EmployeeModel from '../models/employee';
import { EmployeeRole } from '../models/employee';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI!);
        
        const existingSuperAdmin = await EmployeeModel.findOne({ role: EmployeeRole.SUPER_ADMIN });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        // Generate cryptographically secure employee ID
        const randomBytes = crypto.randomBytes(4);
        const employeeId = `EMP${randomBytes.readUInt32BE(0) % 900000 + 100000}`;
        
        // Get password from environment variable
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
        if (!superAdminPassword) {
            throw new Error('SUPER_ADMIN_PASSWORD environment variable is required');
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(superAdminPassword, salt);

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
        
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

createSuperAdmin(); 