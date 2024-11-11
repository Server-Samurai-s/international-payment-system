# International Payment System with React, Node.js, and MongoDB

## Video Showcase
https://youtu.be/j028SdHNzDo

## Technologies Used

- **Frontend**:
  - React (with TypeScript)
  - React Router DOM
  - Bootstrap (for styling)
  - Three.js (for 3D animations)
  - Framer Motion (for UI animations)
  - React Three Fiber
  - React Three Drei
  
- **Backend**:
  [Previous backend technologies remain the same]
  
- **Security**:
  [Previous security features remain the same]
  - XSS Protection (xss-clean)
  - HSTS Headers
  - Cookie Session Management
  
- **Testing & CI/CD**:
  - Jest
  - React Testing Library
  - CircleCI Integration
  - SonarCloud Analysis
  - GitHub Actions

## Development Setup

### Prerequisites

[Previous prerequisites remain the same]

### Environment Setup

1. **Frontend Environment Variables**:
   Create a `.env` file in the frontend directory with:
   ```
   HTTPS=YOUR_VALUE
   ```

2. **Backend Environment Variables**:
   Create a `.env` file in the backend directory with:
   ```
   PORT=3001
  NODE_ENV="YOUR_VALUE"
  ATLAS_URI="YOUR_VALUE"
  JWT_SECRET="YOUR_VALUE"
  SESSION_SECRET="YOUR_VALUE"
  CORS_ORIGIN="YOUR_VALUE"
  ENCRYPTION_KEY="YOUR_VALUE"
   ```

### Running Tests

1. **Frontend Tests**:
```bash
cd frontend
npm test
```

2. **Backend Tests**:
```bash
cd backend
npm test
```

### CI/CD Pipeline

The project includes automated CI/CD pipelines using both CircleCI and GitHub Actions:

1. **CircleCI Pipeline**:
- Runs tests for both frontend and backend
- Builds the application
- Performs SonarCloud analysis
- Deploys to staging/production environments

2. **GitHub Actions**:
- Performs security checks
- Validates SSL configuration
- Checks for common web vulnerabilities
- Runs comprehensive test suites

### Visual Features

The application now includes:
- 3D Earth visualization on the landing page
- Animated star field background
- Smooth UI transitions using Framer Motion
- Responsive design for all screen sizes

[Rest of the README remains the same]

### Troubleshooting

Common Issues:
1. **Three.js Related Errors**:
   - Ensure WebGL is enabled in your browser
   - Update your graphics drivers
   - Clear browser cache

2. **SSL Certificate Issues**:
   [Previous SSL troubleshooting steps remain the same]

3. **Test Environment Issues**:
   - Ensure Jest configuration is properly set up
   - Check that all test dependencies are installed
   - Verify that test environment variables are set correctly
```

This update reflects the new features and technologies added to the project, particularly the 3D visualization components, enhanced testing setup, and CI/CD pipeline configurations. The structure references:


````1:237:README.md
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
  - Input validation with RegEx patterns
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
git clone https://github.com/Server-Samurai-s/international-payment-system.git
cd customer-portal
```

### Setting up SSL Certificates

1. Create a `src/keys` folder in the project root directory:

```bash
mkdir -p src/keys
```

2. Copy the `certificate.pem` and `mongodb-key.pem` files from the project submission folder into the `src/keys` directory.

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

3. **Set up environment variables**:
   - Create a `.env` file in the frontend directory
   - Copy the contents from `frontend-env-values.txt` in the project submission folder into this `.env` file

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

3. **Set up environment variables**:
   - Create a `.env` file in the backend directory
   - Copy the contents from `backend-env-values.txt` in the project submission folder into this `.env` file

---

## Environment Variables

Ensure that you have set up the `.env` files for both frontend and backend as described in the setup steps above. These files should contain all necessary environment variables for the project to run correctly.

---

## Running the Project

1. **Run the backend server**:

```bash
cd backend
npm start
```

The server will start at `https://localhost:3001` (or the port specified in your backend `.env` file).

2. **Run the frontend React app**:

```bash
cd frontend
npm start
```

The app will start at `http://localhost:3000` (or the port specified in your frontend `.env` file).

---
# Admin Login Details 
Username: superadmin
Password: SuperAdmin123!

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

## Employee Portal

The Employee Portal is a safe interface made for bank employees who have already registered to handle and confirm foreign transactions that clients have started. The purpose of this site is to facilitate the authorization and sending of transactions via SWIFT, the main international payment mechanism, while also guaranteeing the protection of sensitive data.

### Key Features
1. User Authentication and Pre-Configuration: Employees don't need to register since their accounts are already set up to improve security and reduce the possibility of unwanted access. Salting and hashing are two enforced password security techniques that safeguard saved credentials.
2. Data Protection and Security Measures: SSL encryption is applied to ensure data integrity and confidentiality during transmission. Input whitelisting using regular expressions prevents injection attacks, ensuring only authorized inputs are accepted.
Protection against common web attacks, including:
- SQL Injection
- Cross-Site Scripting (XSS)
- Man-in-the-Middle (MITM) attacks
- DDoS attacks
- Clickjacking
- Session hijacking
3. Secure DevSecOps Pipeline: A CircleCI pipeline integrates SonarQube to scan for vulnerabilities, hotspots, and code smells. Frequent pipeline checks guarantee that the application remains highly resilient to attacks by enforcing code quality and security requirements.
4. Transaction Management: Employees verify transaction details (e.g., account information and SWIFT code) before forwarding payments to SWIFT. 
5. Error Handling and Logging: Detailed logging provides a secure audit trail for all activities within the employee portal.
 

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

---

## Local Development Setup

### SSL Configuration
For secure HTTPS development, follow these steps:

1. **Trust the Root Certificate**
   Navigate to the certificate directory and trust the root certificate:
   ```bash
   cd backend/src/keys/ca
   
   # For macOS:
   sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" rootCA.pem
   
   # For Windows:
   certutil -addstore -f "ROOT" rootCA.pem
   
   # For Linux:
   sudo cp rootCA.pem /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

2. **Start the Servers**
   ```bash
   # Start backend (in backend directory)
   npm install
   npm start
   
   # Start frontend (in frontend directory)
   npm install
   npm start
   ```

### Troubleshooting
If you encounter certificate errors:
1. Ensure you've trusted the root certificate
2. Clear your browser cache
3. Restart both servers (backend first, then frontend)
