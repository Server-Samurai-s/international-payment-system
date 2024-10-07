import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from "react-router-dom";

interface PaymentFormState {
    recipientName: string;
    recipientBank: string;
    accountNumber: string;
    amount: string;
    swiftCode: string;
}

const PaymentForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [form, setForm] = useState<PaymentFormState>({
        recipientName: "",
        recipientBank: "",
        accountNumber: "",
        amount: "",
        swiftCode: "",
    });

    useEffect(() => {
        if (location.state) {
            const transaction = location.state as PaymentFormState;
            setForm(transaction);
        }
    }, [location.state]);    

    // Handle input changes
    const updateForm = (value: Partial<PaymentFormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
    };

    // Handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = localStorage.getItem("jwt"); // Assuming JWT is stored in localStorage
        if (!token) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        const transactionData = {
            ...form,
            userId: localStorage.getItem("userId"), // Assuming userId is stored in localStorage
            transactionDate: new Date().toISOString(), // Automatically set the transaction date
        };

        try {
            const response = await fetch("https://international-payment-system-backend.vercel.app/transactions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Pass the token for authorization
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Transaction created:", data);

            // Reset form and navigate to dashboard
            setForm({
                recipientName: "",
                recipientBank: "",
                accountNumber: "",
                amount: "",
                swiftCode: "",
            });
            navigate("/dashboard"); // Redirect to dashboard after payment
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Failed to process payment. Please try again.");
        }
    };

    // Handle cancel button click
    const handleCancelBtn = () => {
        setForm({
            recipientName: "",
            recipientBank: "",
            accountNumber: "",
            amount: "",
            swiftCode: "",
        });
        navigate("/dashboard");
    };

    return (
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: '500px', backgroundColor: '#f9f9f9' }}>
            <h3 className="text-center mb-4">International Payment Form</h3>
            <form onSubmit={onSubmit}>
                {/* Recipient's Name */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="recipientName" className="form-label">Recipient's Name</label>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="recipientName"
                            placeholder="Enter Recipient's Name"
                            value={form.recipientName}
                            onChange={(e) => updateForm({ recipientName: e.target.value })}
                        />
                    </div>
                </div>

                {/* Recipient's Bank */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="recipientBank" className="form-label">Recipient's Bank</label>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="recipientBank"
                            placeholder="Enter Recipient's Bank"
                            value={form.recipientBank}
                            onChange={(e) => updateForm({ recipientBank: e.target.value })}
                        />
                    </div>
                </div>

                {/* Recipient's Account Number */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="accountNumber" className="form-label">Recipient's Account No.</label>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="accountNumber"
                            placeholder="Enter Recipient's Account No."
                            value={form.accountNumber}
                            onChange={(e) => updateForm({ accountNumber: e.target.value })}
                        />
                    </div>
                </div>

                {/* Amount to Transfer */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="amount" className="form-label">Amount to Transfer</label>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="amount"
                            placeholder="Enter Amount"
                            value={form.amount}
                            onChange={(e) => updateForm({ amount: e.target.value })}
                        />
                    </div>
                </div>

                {/* SWIFT Code */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <label htmlFor="swiftCode" className="form-label">Enter SWIFT Code</label>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            id="swiftCode"
                            placeholder="Enter Bank Swift Code"
                            value={form.swiftCode}
                            onChange={(e) => updateForm({ swiftCode: e.target.value })}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">PAY NOW</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
