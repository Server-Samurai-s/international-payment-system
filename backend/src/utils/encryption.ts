import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Use a consistent key length of 32 bytes (256 bits) for AES-256-CBC
const ENCRYPTION_KEY = Buffer.from(
    process.env.ENCRYPTION_KEY || 
    crypto.scryptSync('your-fallback-password', 'salt', 32).toString('hex'),
    'hex'
);
const IV_LENGTH = 16;

export function encryptAccountNumber(accountNumber: string): string {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(accountNumber, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt account number');
    }
}

export function decryptAccountNumber(encryptedText: string): string {
    try {
        const [ivHex, encryptedHex] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt account number');
    }
} 