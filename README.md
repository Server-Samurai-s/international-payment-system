# International Payment System with React, Node.js, and MongoDB

This project is an **International Payment System** built using **React** for the frontend, **Node.js** for the backend, and **MongoDB** for the database. It allows customers to register, log in, and perform international transactions.

## Features

- **Customer Registration**: Users can sign up by providing their full name, email address, account number, ID number, and password.
- **Customer Login**: Registered users can log in using their username or account number and password.
- **Dashboard**: Displays a greeting message with account details, payment history, and options to make payments.
- **Payment Processing**: Users can make local and international payments by providing the recipient's account information and SWIFT code for international transfers.
- **Protected Routes**: The dashboard is only accessible to logged-in users.
- **Token-Based Authentication**: JWT is used to authenticate users, ensuring that sensitive areas of the app are protected.
- **Secure Data Storage**: All sensitive user information is hashed and securely stored in MongoDB.

## Technologies Used

- **Frontend**:
  - React (with TypeScript)
  - React Router DOM
  - Bootstrap (for styling)
  
- **Backend**:
  - Node.js (with TypeScript)
  - Express.js
  - MongoDB (with Mongoose)
  - JWT (for authentication)
  - bcrypt (for password hashing)
  - Helmet (for security headers)
  - Express Brute (for brute-force protection)
  
- **Security**:
  - SSL for secure connections
  - Input validation with RegEx
  - Password hashing and salting using bcrypt

---

## Table of Contents

1. [Installation](#installation)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Environment Variables](#environment-variables)
5. [Running the Project](#running-the-project)
6. [Key Functionalities](#key-functionalities)
7. [Contributing](#contributing)
8. [License](#license)

---

## Installation

### Prerequisites

Ensure that you have the following installed:

- Node.js (>= 14.x.x)
- MongoDB (running locally or using MongoDB Atlas)
- npm (Node Package Manager)
- Git (optional, but recommended)

### Cloning the Repository

```bash
git clone https://github.com/your-username/customer-portal.git
cd customer-portal
```

---

## Frontend Setup

1. **Navigate to the frontend folder**:

```bash
cd frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run the React app**:

```bash
npm start
```

---

## Backend Setup

1. **Navigate to the backend folder**:

```bash
cd backend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run the Node.js server**:

```bash
npm start
```

---

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the **backend** folder:

```bash
# MongoDB connection string
ATLAS_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<your-db>?retryWrites=true&w=majority

# JWT secret key for signing tokens
JWT_SECRET=your_jwt_secret

# Port for the backend server
PORT=3001
```

> Note: Replace `<username>`, `<password>`, and `<your-db>` with your actual MongoDB connection details.

---

## Running the Project

1. **Run the backend server**:

```bash
cd backend
npm start
```

The server will start at `https://localhost:3001`.

2. **Run the frontend React app**:

```bash
cd frontend
npm start
```

The app will start at `http://localhost:3000`.

---

## Key Functionalities

### User Authentication

- Users can register and log in using a username or account number and password.
- Passwords are hashed and salted before being stored in the MongoDB database.
- JWT tokens are generated upon login and stored in the browser’s localStorage to maintain user sessions.

### Customer Dashboard

- The dashboard displays:
  - User’s account information
  - Local and international payment options
  - Recent transaction history
- **Protected Route**: The dashboard is only accessible to logged-in users. If a user tries to access it without logging in, they are redirected to the login page.

### Payment Processing

- Users can make local or international payments.
- The form collects recipient information (e.g., SWIFT code for international transfers), and submits the payment data to the backend.
- All transactions are stored securely in the MongoDB database.

---

## Contributing

Contributions are always welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the project.
2. Create a new feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

### Contact

If you have any questions or suggestions, feel free to open an issue or contact the project maintainer at:

- Email: davidroymellors@gmail.com
- GitHub: [davidrmellors](https://github.com/davidrmellors)