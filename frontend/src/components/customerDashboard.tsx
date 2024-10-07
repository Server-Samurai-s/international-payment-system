import React, { useState, useEffect } from "react"; // Import React hooks for managing component state and side effects
import { useNavigate } from "react-router-dom"; // Import hook for navigation between pages
import registerBackground from '../images/registerBackground.jpg'; // Import the background image for the dashboard
import '../styles/customerDashboard.css'; // Import the CSS file for styling the dashboard

//--------------------------------------------------------------------------------------------------------//

// Interface to define the state structure for the dashboard
interface DashboardState {
    firstName: string; // Stores the user's first name
}

//--------------------------------------------------------------------------------------------------------//

// Interface to define the structure of each transaction
interface Transaction {
    _id: string; // Unique identifier for each transaction
    recipientName: string; // Name of the recipient
    recipientBank: string; // Name of the recipient's bank
    recipientAccountNo: string; // Account number of the recipient (plain text)
    amount: number; // Transaction amount
    transactionDate?: string; // Optional field for the date of the transaction (could be undefined)
}

//--------------------------------------------------------------------------------------------------------//

// Functional component for the customer dashboard
const CustomerDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardState>({ firstName: "" }); // State to hold the user's first name
    const [transactions, setTransactions] = useState<Transaction[]>([]); // State to hold the list of transactions
    const navigate = useNavigate(); // Hook for programmatic navigation

    // Function to navigate to the payment page
    const handlePaymentsBtn = () => {
        navigate("/payment"); // Redirect to the payment page
    };

//--------------------------------------------------------------------------------------------------------//

    // useEffect hook to run when the component mounts or when 'navigate' changes
    useEffect(() => {
        const savedFirstName = localStorage.getItem("firstName"); // Retrieve the user's first name from local storage
        if (savedFirstName) {
            // If the first name is found in local storage, set it in the dashboard state
            setDashboard((prev) => ({
                ...prev, // Spread operator to retain any other existing properties in the state
                firstName: savedFirstName, // Update the first name
            }));
            fetchTransactions(); // Fetch the user's transactions from the backend
        } else {
            // If no first name is found, redirect to the login page
            navigate("/login");
        }
    }, [navigate]); // Re-run effect if the 'navigate' dependency changes

//--------------------------------------------------------------------------------------------------------//

    // Function to fetch the user's transactions from the backend
    const fetchTransactions = async () => {
        const token = localStorage.getItem("jwt"); // Get the JWT token from local storage
        if (token) {
            try {
                // Send a request to the backend to fetch the transactions
                const response = await fetch("https://localhost:3001/transactions", {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Include the JWT token in the request headers for authentication
                    },
                });
                if (response.ok) {
                    const data = await response.json(); // Parse the JSON response
                    setTransactions(data); // Set the transactions state with the fetched data
                } else {
                    console.error("Failed to fetch transactions"); // Log an error if the request fails
                }
            } catch (error) {
                console.error("Error fetching transactions:", error); // Log any errors that occur during the fetch process
            }
        }
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to handle the "Pay Again" button click
    const handlePayAgain = (transaction: Transaction) => {
        // Navigate to the payment page and pass the transaction data through the route's state
        navigate("/payment", { state: transaction });
    };

//--------------------------------------------------------------------------------------------------------//

    return (
        <div 
            className="customer-dashboard__full-page-container"
            style={{ backgroundImage: `url(${registerBackground})` }} // Set the background image dynamically using the imported image
        >
            <div className="customer-dashboard__container">
                {/* Display a welcome message with the user's first name */}
                <h3 className="customer-dashboard__title">Welcome, {dashboard.firstName}</h3>

                {/* Section to display banking details */}
                <div className="customer-dashboard__section">
                    <h5>Banking Details</h5>
                    <div className="customer-dashboard__banking-details">
                        <p><strong>Current Account</strong></p>
                        <p>Account No: XXXXXXXXXXXX</p> {/* Static account number placeholder */}
                        <p>Available Balance: $1500.00</p> {/* Static balance placeholder */}
                    </div>
                </div>

                {/* Section to display payment receipts */}
                <div className="customer-dashboard__section">
                    <h5>Payment Receipts</h5>
                    <div className="customer-dashboard__transaction-list">
                        {transactions.length > 0 ? (
                            // Map through the transactions and display each one
                            transactions.map((transaction) => (
                                <div key={transaction._id} className="customer-dashboard__transaction-item">
                                    <div>
                                        {/* Display the transaction date if it's valid, otherwise show "Unknown Date" */}
                                        <p className="customer-dashboard__transaction-date">
                                            {transaction.transactionDate && !isNaN(Date.parse(transaction.transactionDate))
                                                ? new Date(transaction.transactionDate).toLocaleDateString() // Format the date if it's valid
                                                : "Unknown Date"} {/* Fallback text if no valid date is found */}
                                        </p>
                                        {/* Display the recipient name or fallback to 'Payment' if no name is available */}
                                        <p>{transaction.recipientName || 'Payment'}</p>
                                    </div>
                                    <div className="customer-dashboard__transaction-amount">
                                        {/* Display the transaction amount */}
                                        <p>${transaction.amount}</p>
                                        {/* Button to trigger the Pay Again function */}
                                        <button 
                                            className="btn btn-primary btn-sm" 
                                            onClick={() => handlePayAgain(transaction)}
                                        >Pay again</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No payment receipts found</p> // Message to display if no transactions are found
                        )}
                    </div>
                </div>

                {/* Quick menu section for additional actions */}
                <div className="customer-dashboard__menu">
                    <h6>Quick Menu</h6>
                    <button className="btn customer-dashboard__menu-btn">Transactions</button>
                    <button className="btn customer-dashboard__menu-btn">Payments</button>
                </div>

                {/* Main button to navigate to the international payment page */}
                <div className="text-center">
                    <button onClick={handlePaymentsBtn} className="btn customer-dashboard__btn-main">Make International Payment</button>
                </div>
            </div>
        </div>
    );
};

//--------------------------------------------------------------------------------------------------------//

export default CustomerDashboard; // Export the component for use in other parts of the application

//------------------------------------------END OF FILE---------------------------------------------------//
