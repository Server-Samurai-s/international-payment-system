import React, { useState, useEffect } from "react"; // Importing necessary React hooks
import { useLocation, useNavigate } from "react-router-dom"; // Importing hooks for navigation and location state management
import '../styles/paymentForm.css'; // Importing CSS for the payment form styles
import registerBackground from '../images/registerBackground.jpg'; // Importing background image for the form

//--------------------------------------------------------------------------------------------------------//

// Define the structure of the form's state
interface PaymentFormState {
    recipientName: string; // Recipient's name
    recipientBank: string; // Recipient's bank
    accountNumber: string; // Account number of the recipient
    amount: string; // Amount to transfer
    swiftCode: string; // SWIFT code for the bank transfer
}

//--------------------------------------------------------------------------------------------------------//

// Main functional component for the payment form
const PaymentForm: React.FC = () => {
    const location = useLocation(); // Accesses the location state passed from previous page
    const navigate = useNavigate(); // Hook for programmatic navigation within the app

//--------------------------------------------------------------------------------------------------------//

    // Defining state to store form input values, initialized as empty strings
    const [form, setForm] = useState<PaymentFormState>({
        recipientName: "", // Recipient's name
        recipientBank: "", // Recipient's bank
        accountNumber: "", // Recipient's account number
        amount: "", // Transfer amount
        swiftCode: "", // Bank SWIFT code
    });

//--------------------------------------------------------------------------------------------------------//

    // State to store validation errors for individual fields
    const [errors, setErrors] = useState<Partial<PaymentFormState>>({});

//--------------------------------------------------------------------------------------------------------//

    // Regular expressions for validating the form fields
    const nameRegex = /^[a-zA-Z\s]+$/; // Validates alphabetic characters and spaces
    const accountNumberRegex = /^\d{6,34}$/; // Validates account number (6 to 34 digits)
    const amountRegex = /^\d+(\.\d{1,2})?$/; // Validates amount with optional decimal points (up to 2)
    const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/; // Validates SWIFT code (8-11 alphanumeric characters)

//--------------------------------------------------------------------------------------------------------//

    // Effect hook to populate the form with pre-existing data if passed through location state
    useEffect(() => {
        if (location.state) {
            const transaction = location.state as PaymentFormState; // Cast location state as PaymentFormState
            setForm(transaction); // Populate the form with existing transaction data
        }
    }, [location.state]); // Re-run this effect when location.state changes

//--------------------------------------------------------------------------------------------------------//

    // Function to update the form state when input changes
    const updateForm = (value: Partial<PaymentFormState>) => {
        setForm((prev) => ({
            ...prev, // Retain previous form values
            ...value, // Update only the changed field value
        }));

        // Clear the error for the field that is being updated
        const fieldName = Object.keys(value)[0]; // Get the key of the field being updated
        setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: "", // Clear the error message for the updated field
        }));
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to validate the entire form before submission
    const validateForm = (): boolean => {
        const newErrors: Partial<PaymentFormState> = {}; // Object to collect any validation errors
        let valid = true; // Flag to check if form is valid

        // Validate recipient's name: Only allows alphabets and spaces
        if (!nameRegex.test(form.recipientName.trim())) {
            newErrors.recipientName = "Invalid recipient name (only alphabets and spaces)";
            valid = false; // Mark form as invalid
        }

        // Validate recipient's bank name: Only allows alphabets and spaces
        if (!nameRegex.test(form.recipientBank.trim())) {
            newErrors.recipientBank = "Invalid bank name (only alphabets and spaces)";
            valid = false; // Mark form as invalid
        }

        // Validate account number: Must be between 6 and 34 digits
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = "Account number must be between 6 and 34 digits";
            valid = false; // Mark form as invalid
        }

        // Validate amount: Must be a valid number with up to 2 decimal places
        if (!amountRegex.test(form.amount)) {
            newErrors.amount = "Please enter a valid amount (up to 2 decimal places)";
            valid = false; // Mark form as invalid
        }

        // Validate SWIFT code: Must be 8 or 11 alphanumeric characters
        if (!swiftCodeRegex.test(form.swiftCode.trim())) {
            newErrors.swiftCode = "The SWIFT code must be 8 or 11 alphanumeric characters (AAAABBCCDDD)";
            valid = false; // Mark form as invalid
        }

        setErrors(newErrors); // Set the errors object to the state
        return valid; // Return whether the form is valid
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission

        // Validate the form before proceeding
        if (!validateForm()) {
            return; // If the form is invalid, stop the submission
        }

        // Retrieve JWT token from local storage for authentication
        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("Please log in first."); // Notify user if not logged in
            navigate("/login"); // Redirect to login page
            return;
        }

        // Prepare transaction data to send to the server
        const transactionData = {
            ...form, // Include form data (recipient details, amount, etc.)
            userId: localStorage.getItem("userId"), // Include user ID from local storage
        };

        try {
            // Make POST request to backend to create the transaction
            const response = await fetch("https://localhost:3001/transactions/create", {
                method: "POST", // HTTP POST method
                headers: {
                    "Content-Type": "application/json", // Indicating JSON data
                    "Authorization": `Bearer ${token}`, // Include the JWT token for authentication
                },
                body: JSON.stringify(transactionData), // Convert the data to JSON for transmission
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`); // Handle error if response is not OK
            }

            const data = await response.json(); // Parse JSON response
            console.log("Transaction created:", data); // Log the response data

            // Reset the form fields after successful transaction
            setForm({
                recipientName: "",
                recipientBank: "",
                accountNumber: "",
                amount: "",
                swiftCode: "",
            });

            // Redirect the user to the dashboard after successful transaction
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating transaction:", error); // Log the error
            alert("Failed to process payment. Please try again."); // Alert the user on failure
        }
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to handle form cancelation
    const handleCancelBtn = () => {
        // Reset form fields to empty
        setForm({
            recipientName: "",
            recipientBank: "",
            accountNumber: "",
            amount: "",
            swiftCode: "",
        });
        navigate("/dashboard"); // Redirect user back to dashboard
    };

//--------------------------------------------------------------------------------------------------------//

    return (
        <div
            className="payment-form__full-page-container" // Container for full-page layout
            style={{ backgroundImage: `url(${registerBackground})` }} // Apply background image
        >
            <div className="payment-form__container"> {/* Main form container */}
                <h3 className="payment-form__title">International Payment Form</h3> {/* Form title */}
                <form onSubmit={onSubmit}> {/* Form submission handler */}
                    <div className="payment-form__group"> {/* Input group for recipient's name */}
                        <label htmlFor="recipientName">Recipient's Name</label>
                        <input
                            type="text"
                            id="recipientName"
                            value={form.recipientName} // Bind input value to state
                            onChange={(e) => updateForm({ recipientName: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for recipientName if it exists */}
                        {errors.recipientName && (
                            <div className="payment-form__tooltip">{errors.recipientName}</div>
                        )}
                    </div>

                    <div className="payment-form__group"> {/* Input group for recipient's bank */}
                        <label htmlFor="recipientBank">Recipient's Bank</label>
                        <input
                            type="text"
                            id="recipientBank"
                            value={form.recipientBank} // Bind input value to state
                            onChange={(e) => updateForm({ recipientBank: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for recipientBank if it exists */}
                        {errors.recipientBank && (
                            <div className="payment-form__tooltip">{errors.recipientBank}</div>
                        )}
                    </div>

                    <div className="payment-form__group"> {/* Input group for account number */}
                        <label htmlFor="accountNumber">Recipient's Account No.</label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={form.accountNumber} // Bind input value to state
                            onChange={(e) => updateForm({ accountNumber: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for accountNumber if it exists */}
                        {errors.accountNumber && (
                            <div className="payment-form__tooltip">{errors.accountNumber}</div>
                        )}
                    </div>

                    <div className="payment-form__group"> {/* Input group for amount */}
                        <label htmlFor="amount">Amount to Transfer</label>
                        <input
                            type="text"
                            id="amount"
                            value={form.amount} // Bind input value to state
                            onChange={(e) => updateForm({ amount: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for amount if it exists */}
                        {errors.amount && <div className="payment-form__tooltip">{errors.amount}</div>}
                    </div>

                    <div className="payment-form__group"> {/* Input group for SWIFT code */}
                        <label htmlFor="swiftCode">Enter SWIFT Code</label>
                        <input
                            type="text"
                            id="swiftCode"
                            value={form.swiftCode} // Bind input value to state
                            onChange={(e) => updateForm({ swiftCode: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for swiftCode if it exists */}
                        {errors.swiftCode && <div className="payment-form__tooltip">{errors.swiftCode}</div>}
                    </div>

                    {/* Form buttons: Submit and Cancel */}
                    <div className="d-flex justify-content-between">
                        <button type="submit" className="payment-form__btn-primary">PAY NOW</button> {/* Submit button */}
                        <button type="button" className="payment-form__btn-cancel" onClick={handleCancelBtn}> {/* Cancel button */}
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

//--------------------------------------------------------------------------------------------------------//

export default PaymentForm; // Exporting the PaymentForm component for use elsewhere

//------------------------------------------END OF FILE---------------------------------------------------//
