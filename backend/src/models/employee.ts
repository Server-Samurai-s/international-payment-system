import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum EmployeeRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    MANAGER = 'MANAGER',
    AGENT = 'AGENT'
}

export interface IEmployee extends Document {
    employeeId: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role: EmployeeRole;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const employeeSchema: Schema<IEmployee> = new Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        match: /^EMP\d{6}$/ 
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Za-z0-9_]+$/
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(EmployeeRole),
        required: true
    }
});

employeeSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IEmployee>('Employee', employeeSchema);