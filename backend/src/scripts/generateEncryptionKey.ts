import crypto from 'crypto';

// Generate a random 32-byte (256-bit) key and convert to hex
const key = crypto.randomBytes(32).toString('hex');
console.log('Add this to your .env file:');
console.log(`ENCRYPTION_KEY=${key}`); 