import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user';
import { encryptAccountNumber } from '../utils/encryption';

dotenv.config();

async function migrateUsers() {
    try {
        await mongoose.connect(process.env.ATLAS_URI!);
        console.log('Connected to MongoDB');

        const users = await User.find();
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            // Generate a random account number if none exists
            const tempAccountNumber = Math.random().toString().slice(2, 18);
            user.accountNumber = encryptAccountNumber(tempAccountNumber);
            await user.save();
            console.log(`Migrated user: ${user.username} with temporary account number: ${tempAccountNumber}`);
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateUsers(); 