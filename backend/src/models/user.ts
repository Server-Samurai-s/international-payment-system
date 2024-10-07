import mongoose, { Schema, Document } from 'mongoose'; // Import mongoose, schema, and document types for MongoDB schema definition
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing and comparison

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
    required: true, // Account number is required
    match: /^\d{7,11}$/, // Regular expression to ensure account number is 7 to 11 digits long
  },
  idNumber: {
    type: String,
    required: true, // ID number is required
    match: /^\d{13}$/, // Regular expression to ensure ID number is exactly 13 digits
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

// Export the User model, using the userSchema for MongoDB operations
export const User = mongoose.model<IUser>('User', userSchema);

//------------------------------------------END OF FILE---------------------------------------------------//


