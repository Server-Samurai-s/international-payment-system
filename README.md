# International Payment System

A secure international payment processing system built with React, Node.js, and MongoDB, featuring 3D visualizations and comprehensive security measures.

## Video Demo
[Watch Demo](https://youtu.be/j028SdHNzDo)

## Features

- **Secure Authentication**
  - JWT-based authentication
  - Password hashing and salting
  - Session management
  - Protected routes

- **Payment Processing**
  - Local and international transfers
  - SWIFT code verification
  - Real-time transaction status
  - Secure data encryption

- **Employee Portal**
  - Transaction verification interface
  - SWIFT payment processing
  - Audit logging
  - Role-based access control

- **Visual Features**
  - 3D Earth visualization
  - Animated starfield background
  - Responsive design
  - Smooth UI transitions

## Technology Stack

### Frontend
- React (TypeScript)
- React Router DOM
- Three.js & React Three Fiber
- Framer Motion
- Bootstrap

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- SSL/TLS Encryption

### Security
- XSS Protection
- HSTS Headers
- Rate Limiting
- Cookie Session Management
- SQL Injection Prevention
- CSRF Protection

### Testing & CI/CD
- Jest
- React Testing Library
- CircleCI
- SonarCloud
- GitHub Actions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- SSL Certificate (for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/international-payment-system.git
cd international-payment-system
```

2. **Set up SSL certificates for Windows**
- Run Powershell as administrator
```bash
cd backend/src/keys/ca

# For Windows - Run Powershell as administrator
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\generate-certs.ps1
certutil -addstore -f "ROOT" rootCA.pem
```

3. **Set up SSL certificates for MacOS**
```bash
# Make the script executable
chmod +x backend/src/keys/ca/generate-certs.sh

# Run the script
cd backend/src/keys/ca
./generate-certs.sh

sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" rootCA.pem
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
```

4. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
```

### Environment Variables

1. **Frontend (.env)**
```
HTTPS=true
REACT_APP_API_URL=https://localhost:3001
```

2. **Backend (.env)**
```
PORT=3001
NODE_ENV=development
ATLAS_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CORS_ORIGIN=https://localhost:3000
```

### Running the Application

1. **Start Backend**
```bash
cd backend
npm start
```

2. **Start Frontend**
```bash
cd frontend
npm start
```

Access the application at `https://localhost:3000`

## Testing

```bash
# Frontend Tests
cd frontend
npm test

# Backend Tests
cd backend
npm test
```

## Security Features

- SSL/TLS Encryption
- Input Validation
- XSS Protection
- CSRF Protection
- Rate Limiting
- SQL Injection Prevention
- Session Management
- HSTS Headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

David Mellors - davidroymellors@gmail.com
GitHub: [@davidrmellors](https://github.com/davidrmellors)