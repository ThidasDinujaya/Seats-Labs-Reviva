import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ManagerReportsPage from './pages/ManagerReportsPage';
import ManagerUsersPage from './pages/ManagerUsersPage';
import ManagerServicesPage from './pages/ManagerServicesPage';
import ManagerBookingsPage from './pages/ManagerBookingsPage';
import ManagerPaymentsPage from './pages/ManagerPaymentsPage';
import ManagerFeedbacksPage from './pages/ManagerFeedbacksPage';
import ManagerComplaintsPage from './pages/ManagerComplaintsPage';
import ManagerAdsPage from './pages/ManagerAdsPage';
import ManagerTasksPage from './pages/ManagerTasksPage';
import ManagerRefundsPage from './pages/ManagerRefundsPage';
import ManagerSettingsPage from './pages/ManagerSettingsPage';
import ManagerLoginPage from './pages/ManagerLoginPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianLoginPage from './pages/TechnicianLoginPage';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import AdvertiserLoginPage from './pages/AdvertiserLoginPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ReviewsPage from './pages/ReviewsPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import PaymentPage from './pages/PaymentPage';
import ComingSoon from './pages/ComingSoon';
import './App.css';

// ============================================================
// src/App.js
// PURPOSE: Main application routing and context providers
// ============================================================

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/book" element={<BookingPage />} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerBookingsPage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
          <Route path="/manager/users" element={<ManagerUsersPage />} />
          <Route path="/manager/services" element={<ManagerServicesPage />} />
          <Route path="/manager/payments" element={<ManagerPaymentsPage />} />
          <Route path="/manager/feedbacks" element={<ManagerFeedbacksPage />} />
          <Route path="/manager/complaints" element={<ManagerComplaintsPage />} />
          <Route path="/manager/ads" element={<ManagerAdsPage />} />
          <Route path="/manager/tasks" element={<ManagerTasksPage />} />
          <Route path="/manager/refunds" element={<ManagerRefundsPage />} />
          <Route path="/manager/settings" element={<ProfileSettingsPage role="manager" />} />
          <Route path="/manager/website-settings" element={<ManagerSettingsPage />} />
          <Route path="/manager/login" element={<ManagerLoginPage />} />
          
          {/* Technician Routes */}
          <Route path="/technician" element={<TechnicianDashboard />} />
          <Route path="/technician/settings" element={<ProfileSettingsPage role="technician" />} />
          <Route path="/technician/login" element={<TechnicianLoginPage />} />
          
          {/* Advertiser Routes */}
          <Route path="/advertiser" element={<AdvertiserDashboard />} />
          <Route path="/advertiser/payments" element={<ComingSoon role="advertiser" title="Advertiser Payments" />} />
          <Route path="/advertiser/settings" element={<ProfileSettingsPage role="advertiser" />} />
          <Route path="/advertiser/login" element={<AdvertiserLoginPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Customer Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/settings" 
            element={
              <ProtectedRoute>
                <ProfileSettingsPage role="customer" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/refunds" 
            element={
              <ProtectedRoute>
                <ComingSoon role="customer" title="Request Refunds" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/complaints" 
            element={
              <ProtectedRoute>
                <ComingSoon role="customer" title="Complaints" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/feedbacks" 
            element={
              <ProtectedRoute>
                <ComingSoon role="customer" title="Feedbacks" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/:bookingId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/ad/:adId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
