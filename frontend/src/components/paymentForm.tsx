import React, { useState, useEffect } from "react"; // Import React hooks for managing state and side effects
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks for navigation and location state
import '../styles/paymentForm.css'; // Import CSS file for payment form styling
import registerBackground from '../images/registerBackground.jpg'; // Import background image for the payment form

//--------------------------------------------------------------------------------------------------------//

// Define the structure of the form's state
interface PaymentFormState {
    recipientName: string; // Recipient's name
    recipientBank: string; // Recipient's bank
    accountNumber: string; // Recipient's account number (plain text)
    amount: string; // Amount to transfer
    swiftCode: string; // SWIFT code for the recipient's bank
}

//--------------------------------------------------------------------------------------------------------//

// Functional component for the payment form
const PaymentForm: React.FC = () => {
    const location = useLocation(); // Hook to access passed state from the previous page
    const navigate = useNavigate(); // Hook for programmatic navigation

//--------------------------------------------------------------------------------------------------------//

    // State to store the form input values
    const [form, setForm] = useState<PaymentFormState>({
        recipientName: "", // Default value for recipient's name
        recipientBank: "", // Default value for recipient's bank
        accountNumber: "", // Default value for recipient's account number
        amount: "", // Default value for amount
        swiftCode: "", // Default value for SWIFT code
    });

//--------------------------------------------------------------------------------------------------------//

    // State to store any validation errors
    const [errors, setErrors] = useState<Partial<PaymentFormState>>({});

//--------------------------------------------------------------------------------------------------------//

    // Regular expressions for validating the form fields
    const nameRegex = /^[a-zA-Z\s]+$/; // Allow alphabets and spaces only
    const accountNumberRegex = /^\d{6,34}$/; // Account number should be 6 to 34 digits
    const amountRegex = /^\d+(\.\d{1,2})?$/; // Amount should be a number with optional decimal places (up to 2)
    const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/; // SWIFT code should be 8 to 11 alphanumeric characters

//--------------------------------------------------------------------------------------------------------//

    // Effect to populate the form with passed transaction data if available
    useEffect(() => {
        if (location.state) {
            const transaction = location.state as PaymentFormState; // Cast the state to the PaymentFormState type
            setForm(transaction); // Set the form state with the transaction data
        }
    }, [location.state]); // The effect will re-run if location.state changes

//--------------------------------------------------------------------------------------------------------//

    // Function to update form state when input values change
    const updateForm = (value: Partial<PaymentFormState>) => {
        setForm((prev) => ({
            ...prev, // Retain previous form values
            ...value, // Update the specific field that changed
        }));
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to validate the form fields before submission
    const validateForm = (): boolean => {
        const newErrors: Partial<PaymentFormState> = {}; // Object to store any validation errors
        let valid = true; // Flag to track if the form is valid

        // Validate recipient's name
        if (!nameRegex.test(form.recipientName.trim())) {
            newErrors.recipientName = "Invalid recipient name (only alphabets and spaces)";
            valid = false; // Mark form as invalid if this fails
        }

        // Validate recipient's bank name
        if (!nameRegex.test(form.recipientBank.trim())) {
            newErrors.recipientBank = "Invalid bank name (only alphabets and spaces)";
            valid = false; // Mark form as invalid if this fails
        }

        // Validate account number
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = "Account number must be between 6 and 34 digits";
            valid = false; // Mark form as invalid if this fails
        }

        // Validate amount
        if (!amountRegex.test(form.amount)) {
            newErrors.amount = "Please enter a valid amount (up to 2 decimal places)";
            valid = false; // Mark form as invalid if this fails
        }

        // Validate SWIFT code
        if (!swiftCodeRegex.test(form.swiftCode.trim())) {
            newErrors.swiftCode = "The SWIFT code must be 8 or 11 alphanumeric characters (AAAABBCCDDD)";
            valid = false; // Mark form as invalid if this fails
        }

        setErrors(newErrors); // Set the error state with any found validation errors
        return valid; // Return whether the form is valid
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent the default form submission

        // Validate the form before proceeding
        if (!validateForm()) {
            return; // If the form is invalid, do not submit
        }

        // Get the JWT token from local storage for authentication
        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("Please log in first."); // Alert user if they are not logged in
            navigate("/login"); // Redirect to login page
            return;
        }

        // Prepare the transaction data to be sent to the server
        const transactionData = {
            ...form, // Include all form fields
            userId: localStorage.getItem("userId"), // Add the user ID from local storage
        };

        // Send the transaction data to the backend via POST request
        try {
            const response = await fetch("https://localhost:3001/transactions/create", {
                method: "POST", // HTTP method
                headers: {
                    "Content-Type": "application/json", // Set content type to JSON
                    "Authorization": `Bearer ${token}`, // Include JWT token for authentication
                },
                body: JSON.stringify(transactionData), // Convert the transaction data to JSON
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`); // Throw an error if response is not OK
            }

            const data = await response.json(); // Parse the response JSON
            console.log("Transaction created:", data); // Log the created transaction

            // Reset the form fields after successful submission
            setForm({
                recipientName: "",
                recipientBank: "",
                accountNumber: "",
                amount: "",
                swiftCode: "",
            });

            // Redirect to the dashboard after successful transaction
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating transaction:", error); // Log any errors
            alert("Failed to process payment. Please try again."); // Alert user if there is a failure
        }
    };

//--------------------------------------------------------------------------------------------------------//

    // Function to handle form cancelation
    const handleCancelBtn = () => {
        // Reset the form fields
        setForm({
            recipientName: "",
            recipientBank: "",
            accountNumber: "",
            amount: "",
            swiftCode: "",
        });
        navigate("/dashboard"); // Redirect to the dashboard
    };

//------------------------------------------------------------------------------------------------

    return (
        <div
            className="payment-form__full-page-container"
            style={{ backgroundImage: `url(${registerBackground})` }} // Set the background image
        >
            <div className="payment-form__container">
                <h3 className="payment-form__title">International Payment Form</h3>
                <form onSubmit={onSubmit}> {/* Form submission handler */}
                    <div className="payment-form__group">
                        <label htmlFor="recipientName">Recipient's Name</label>
                        <input
                            type="text"
                            id="recipientName"
                            value={form.recipientName} // Bind input value to form state
                            onChange={(e) => updateForm({ recipientName: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for recipientName if it exists */}
                        {errors.recipientName && <div className="payment-form__tooltip">{errors.recipientName}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="recipientBank">Recipient's Bank</label>
                        <input
                            type="text"
                            id="recipientBank"
                            value={form.recipientBank} // Bind input value to form state
                            onChange={(e) => updateForm({ recipientBank: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for recipientBank if it exists */}
                        {errors.recipientBank && <div className="payment-form__tooltip">{errors.recipientBank}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="accountNumber">Recipient's Account No.</label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={form.accountNumber} // Bind input value to form state
                            onChange={(e) => updateForm({ accountNumber: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for accountNumber if it exists */}
                        {errors.accountNumber && <div className="payment-form__tooltip">{errors.accountNumber}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="amount">Amount to Transfer</label>
                        <input
                            type="text"
                            id="amount"
                            value={form.amount} // Bind input value to form state
                            onChange={(e) => updateForm({ amount: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for amount if it exists */}
                        {errors.amount && <div className="payment-form__tooltip">{errors.amount}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="swiftCode">Enter SWIFT Code</label>
                        <input
                            type="text"
                            id="swiftCode"
                            value={form.swiftCode} // Bind input value to form state
                            onChange={(e) => updateForm({ swiftCode: e.target.value })} // Update form on change
                        />
                        {/* Display validation error for swiftCode if it exists */}
                        {errors.swiftCode && <div className="payment-form__tooltip">{errors.swiftCode}</div>}
                    </div>

                    {/* Submit and cancel buttons */}
                    <div className="d-flex justify-content-between">
                        <button type="submit" className="payment-form__btn-primary">PAY NOW</button>
                        <button type="button" className="payment-form__btn-cancel" onClick={handleCancelBtn}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

//--------------------------------------------------------------------------------------------------------//

export default PaymentForm; // Export the PaymentForm component

//------------------------------------------END OF FILE---------------------------------------------------//
