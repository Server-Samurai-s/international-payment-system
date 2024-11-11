import mongoose, { Schema, Document } from 'mongoose'; // Import mongoose, schema, and document types for MongoDB schema definition
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing and comparison
import crypto from 'crypto';
import { encryptAccountNumber } from '../utils/encryption';

//--------------------------------------------------------------------------------------------------------//

// Define IUser interface extending mongoose Document with user attributes and methods
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
  password: string;
  accountNumber: string;
  idNumber: string;
  balance: number;
  hashPassword(): Promise<void>; // Method to hash the user's password
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare the candidate password with the hashed password
}

//--------------------------------------------------------------------------------------------------------//

// Define the userSchema for the User collection in MongoDB
const userSchema: Schema<IUser> = new Schema({
  firstName: {
    type: String,
    required: true, // First name is required
    trim: true, // Automatically remove whitespace around the value
  },
  lastName: {
    type: String,
    required: true, // Last name is required
    trim: true, // Automatically remove whitespace around the value
  },
  emailAddress: {
    type: String,
    required: true, // Email address is required
    unique: true, // Ensure email is unique
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regular expression for email validation
  },
  username: {
    type: String,
    required: true, // Username is required
    unique: true, // Ensure username is unique
    match: /^[A-Za-z0-9_]+$/, // Regular expression for validating alphanumeric usernames
  },
  password: {
    type: String,
    required: true, // Password is required
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  idNumber: {
    type: String,
    required: true, // ID number is required
    match: /^\d{13}$/, // Regular expression to ensure ID number is exactly 13 digits
  },
  balance: {
    type: Number,
    default: 10000, // Set default balance to 10000
    required: true,
  },
});

//--------------------------------------------------------------------------------------------------------//

// Method to hash user's password before saving to the database
userSchema.methods.hashPassword = async function (): Promise<void> {
  const salt = await bcrypt.genSalt(12); // Generate salt for hashing with a strength of 12 rounds
  this.password = await bcrypt.hash(this.password, salt); // Hash the password and assign it to the user object
};

//--------------------------------------------------------------------------------------------------------//

// Method to compare a candidate password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password); // Return whether the passwords match
};

//--------------------------------------------------------------------------------------------------------//

// Add before saving a new user
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        await this.hashPassword();
    }
    next();
});

//--------------------------------------------------------------------------------------------------------//


// Add getMaskedAccountNumber function
export function getMaskedAccountNumber(hashedAccountNumber: string): string {
    if (!hashedAccountNumber) return '****';
    // Extract the actual account number from the hash
    const accountNumber = hashedAccountNumber.split(':')[1].slice(-8); // Get last 8 digits of hash
    return `****${accountNumber.slice(-4)}`; // Show last 4 digits
}

//--------------------------------------------------------------------------------------------------------//

// Export the User model, using the userSchema for MongoDB operations
export const User = mongoose.model<IUser>('User', userSchema);

//--------------------------------------------------------------------------------------------------------//

// Add secureAccountNumber function
export async function secureAccountNumber(accountNumber: string): Promise<string> {
    return encryptAccountNumber(accountNumber);
}

//--------------------------------------------------------------------------------------------------------//

//------------------------------------------END OF FILE---------------------------------------------------//


