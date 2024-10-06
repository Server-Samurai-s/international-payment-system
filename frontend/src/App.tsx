import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/navbar";
import PostList from "./components/postList";
// import PostEdit from "./components/postEdit";
import PostCreate from "./components/postCreate";
import SignUp from './components/signUp';
import Login from "./components/login";
import CustomerDashboard from './components/customerDashboard';
import PaymentForm from './components/paymentForm';
import ProtectedRoute from './components/protectedRoute';

const App = () => {
  return (
    <Router>
    <div>
      <Navbar />
      <Routes>
        <Route path="/postList" element={<ProtectedRoute><PostList /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        {/* <Route path="/edit/:id" element={<PostEdit />} /> */}
        <Route path="/create" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;

