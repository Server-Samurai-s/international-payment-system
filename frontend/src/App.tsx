// frontend/src/App.tsx
import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/navbar";
import SignUp from './components/signUp';
import Login from "./components/login";
import CustomerDashboard from './components/customerDashboard';
import PaymentForm from './components/paymentForm';
import ProtectedRoute from './components/protectedRoute';
import Homepage from './components/homePage'; // Import the Homepage component

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} /> {/* Add the homepage route */}
          <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;