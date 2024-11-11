import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user';

dotenv.config();

async function removeAccountNumberField() {
    try {
        await mongoose.connect(process.env.ATLAS_URI!);
        console.log('Connected to MongoDB');

        // First, drop the unique index
        await User.collection.dropIndex('hashedAccountNumber_1');
        console.log('Dropped unique index on hashedAccountNumber');

        // Then remove the field
        const result = await User.collection.updateMany(
            {},
            { $unset: { hashedAccountNumber: "" } }
        );

        console.log(`Updated ${result.modifiedCount} users`);
        console.log('Successfully removed hashedAccountNumber field from all users');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

removeAccountNumberField(); 