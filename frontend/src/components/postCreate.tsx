import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Define the interface for the form state
interface FormState {
    user: string;
    content: string;
    image: string;
}

const PostCreate: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        user: "",
        content: "",
        image: "",
    });
    const navigate = useNavigate();

    // useEffect to retrieve the user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("name"); // Assuming the user is stored in localStorage
        if (savedUser) {
            setForm((prev) => ({
                ...prev,
                user: savedUser,
            }));
        } else {
            navigate("/login"); // Redirect to login if user data is missing
        }
    }, [navigate]);

    // Function to update form state
    const updateForm = (value: Partial<FormState>) => {
        setForm((prev) => ({
            ...prev,
            ...value,
        }));
    };

    // Function to handle image file change
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(",")[1]; // Remove the `data:image/` prefix
                    updateForm({ image: base64String });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                window.alert("Error reading image file.");
            }
        }
    };

    // Function to handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = localStorage.getItem("jwt"); // Retrieve token from localStorage

        const newPost = {
            user: form.user,
            content: form.content,
            image: form.image,
        };

        try {
            const response = await fetch("https://localhost:3001/posts/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const result = await response.json();
            console.log("Post created:", result);

            // Reset form but keep the user
            setForm({ user: form.user, content: "", image: "" });
            navigate("/");

        } catch (error) {
            window.alert(error);
        }
    };

    return (
        <div className="container">
            <h3 className="header">Create New Post</h3>
            <form onSubmit={onSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="user">User</label>
                    <input
                        type="text"
                        className="form-control"
                        id="user"
                        value={form.user}
                        disabled // Make the user field read-only
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <input
                        type="text"
                        className="form-control"
                        id="content"
                        value={form.content}
                        onChange={(e) => updateForm({ content: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                        type="file"
                        className="form-control"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div className="form-group">
                    <input type="submit" value="Create Post" className="btn btn-primary" />
                </div>
            </form>
        </div>
    );
};

export default PostCreate;
