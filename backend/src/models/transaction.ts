// Define the Transaction interface which includes user, recipient, and transaction details
export interface Transaction {
    user: string;
    recipientName: string;
    recipientBank: string;
    accountNumber: string; 
    amount: number;
    swiftCode: string;
    transactionDate?: string; 
}

//--------------------------------------------------------------------------------------------------------//

// Function to retrieve the plain account number (no hashing needed)
export async function getAccountNumber(accountNumber: string): Promise<string> {
    return accountNumber; // Simply return the plain account number
}

//--------------------------------------------------------------------------------------------------------//

// Function to compare a plain account number with another for validation (no hashing comparison needed)
export async function compareAccountNumbers(accountNumber1: string, accountNumber2: string): Promise<boolean> {
    return accountNumber1 === accountNumber2; // Directly compare two plain account numbers
}

//------------------------------------------END OF FILE---------------------------------------------------//
