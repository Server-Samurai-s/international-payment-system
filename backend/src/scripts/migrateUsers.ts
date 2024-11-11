import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user';
import { encryptAccountNumber } from '../utils/encryption';
import crypto from 'crypto';

dotenv.config();

async function generateSecureAccountNumber(): Promise<string> {
    const bytes = crypto.randomBytes(8);
    // Generate a 16-digit number
    return bytes.readBigUInt64BE().toString().padStart(16, '0').slice(0, 16);
}

async function migrateUsers() {
    try {
        await mongoose.connect(process.env.ATLAS_URI!);
        console.log('Connected to MongoDB');

        const users = await User.find();
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            const secureAccountNumber = await generateSecureAccountNumber();
            user.accountNumber = encryptAccountNumber(secureAccountNumber);
            await user.save();
            console.log(`Migrated user: ${user.username}`);
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateUsers(); 