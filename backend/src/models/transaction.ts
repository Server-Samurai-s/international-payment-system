import bcrypt from "bcrypt";

export interface Transaction {
    user: string;
    recipientName: string;
    recipientBank: string;
    accountNumber: string;
    amount: number;
    swiftCode: string;
}

// Hash the account number securely
export async function hashAccountNumber(accountNumber: string): Promise<string> {
    const saltRounds = 10;
    const hashedAccountNumber = await bcrypt.hash(accountNumber, saltRounds);
    return hashedAccountNumber;
}

// Compare the hashed account number for validation purposes
export async function compareAccountNumber(accountNumber: string, hashedAccountNumber: string): Promise<boolean> {
    return bcrypt.compare(accountNumber, hashedAccountNumber);
}
