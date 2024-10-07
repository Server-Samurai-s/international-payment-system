import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
  password: string;
  accountNumber: string;
  idNumber: string;
  accountBalance: number;
  hashPassword(): Promise<void>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email validation
  },
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Za-z0-9_]+$/, // Username validation
  },
  password: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    match: /^\d{7,11}$/, // Account number must be between 7-11 digits
  },
  idNumber: {
    type: String,
    required: true,
    match: /^\d{13}$/, // ID number must be exactly 13 digits
  },
});

// Method to hash password
userSchema.methods.hashPassword = async function (): Promise<void> {
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
};

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
