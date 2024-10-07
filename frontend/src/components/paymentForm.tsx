import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../styles/paymentForm.css';
import registerBackground from '../images/registerBackground.jpg';

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

    const [errors, setErrors] = useState<Partial<PaymentFormState>>({});

    // Regex patterns
    const nameRegex = /^[a-zA-Z\s]+$/; // Only alphabets and spaces
    const accountNumberRegex = /^\d{6,34}$/; // 6-34 digits
    const amountRegex = /^\d+(\.\d{1,2})?$/; // Positive number with up to 2 decimal places
    const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/; // 8 or 11 alphanumeric characters

    useEffect(() => {
        if (location.state) {
            const transaction = location.state as PaymentFormState;
            setForm(transaction);
        }
    }, [location.state]);

    const updateForm = (value: Partial<PaymentFormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<PaymentFormState> = {};
        let valid = true;

        if (!nameRegex.test(form.recipientName.trim())) {
            newErrors.recipientName = "Invalid recipient name (only alphabets and spaces)";
            valid = false;
        }
        if (!nameRegex.test(form.recipientBank.trim())) {
            newErrors.recipientBank = "Invalid bank name (only alphabets and spaces)";
            valid = false;
        }
        if (!accountNumberRegex.test(form.accountNumber)) {
            newErrors.accountNumber = "Account number must be between 6 and 34 digits";
            valid = false;
        }
        if (!amountRegex.test(form.amount)) {
            newErrors.amount = "Please enter a valid amount (up to 2 decimal places)";
            valid = false;
        }
        if (!swiftCodeRegex.test(form.swiftCode.trim())) {
            newErrors.swiftCode = "The SWIFT code must be 8 or 11 alphanumeric characters (e.g., ABCDUS33 or ABCDUS33XXX)";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("Please log in first.");
            navigate("/login");
            return;
        }

        const transactionData = {
            ...form,
            userId: localStorage.getItem("userId"),
        };

        try {
            const response = await fetch("https://localhost:3001/transactions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Transaction created:", data);

            setForm({
                recipientName: "",
                recipientBank: "",
                accountNumber: "",
                amount: "",
                swiftCode: "",
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Failed to process payment. Please try again.");
        }
    };

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
        <div
            className="payment-form__full-page-container"
            style={{ backgroundImage: `url(${registerBackground})` }}
        >
            <div className="payment-form__container">
                <h3 className="payment-form__title">International Payment Form</h3>
                <form onSubmit={onSubmit}>
                    <div className="payment-form__group">
                        <label htmlFor="recipientName">Recipient's Name</label>
                        <input
                            type="text"
                            id="recipientName"
                            value={form.recipientName}
                            onChange={(e) => updateForm({ recipientName: e.target.value })}
                        />
                        {errors.recipientName && <div className="payment-form__tooltip">{errors.recipientName}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="recipientBank">Recipient's Bank</label>
                        <input
                            type="text"
                            id="recipientBank"
                            value={form.recipientBank}
                            onChange={(e) => updateForm({ recipientBank: e.target.value })}
                        />
                        {errors.recipientBank && <div className="payment-form__tooltip">{errors.recipientBank}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="accountNumber">Recipient's Account No.</label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={form.accountNumber}
                            onChange={(e) => updateForm({ accountNumber: e.target.value })}
                        />
                        {errors.accountNumber && <div className="payment-form__tooltip">{errors.accountNumber}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="amount">Amount to Transfer</label>
                        <input
                            type="text"
                            id="amount"
                            value={form.amount}
                            onChange={(e) => updateForm({ amount: e.target.value })}
                        />
                        {errors.amount && <div className="payment-form__tooltip">{errors.amount}</div>}
                    </div>

                    <div className="payment-form__group">
                        <label htmlFor="swiftCode">Enter SWIFT Code</label>
                        <input
                            type="text"
                            id="swiftCode"
                            value={form.swiftCode}
                            onChange={(e) => updateForm({ swiftCode: e.target.value })}
                        />
                        {errors.swiftCode && <div className="payment-form__tooltip">{errors.swiftCode}</div>}
                    </div>

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

export default PaymentForm;
