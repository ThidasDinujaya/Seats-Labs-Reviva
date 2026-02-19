import axios from 'axios';

// ============================================================
// src/api/api.js
// PURPOSE: Axios instance and API helper methods
// ============================================================

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error.message);
  }
);

// API Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const serviceApi = {
  // Services
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  
  // Categories
  getCategories: () => api.get('/services/categories/all'),
  createCategory: (data) => api.post('/services/categories', data),
  updateCategory: (id, data) => api.put(`/services/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/services/categories/${id}`),
  
  // Packages
  getPackages: () => api.get('/services/packages/all'),
  createPackage: (data) => api.post('/services/packages', data),
  updatePackage: (id, data) => api.put(`/services/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/services/packages/${id}`),
};

export const bookingApi = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

export const technicianApi = {
  getAll: () => api.get('/technicians'),
};

export const reportApi = {
  getDailyBookingReport: (date) => api.get('/reports/dailyBooking', { params: { date } }),
  getRevenueAnalysis: (startDate, endDate) => api.get('/reports/revenueAnalysis', { params: { startDate, endDate } }),
  getTechnicianPerformance: (startDate, endDate) => api.get('/reports/technicianPerformance', { params: { startDate, endDate } }),
  getCustomerSatisfaction: (startDate, endDate) => api.get('/reports/customerSatisfaction', { params: { startDate, endDate } }),
  getAdPerformance: (startDate, endDate) => api.get('/reports/adPerformance', { params: { startDate, endDate } }),
};

// USER MANAGEMENT API
export const userApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const advertisementApi = {
  create: (data) => api.post('/advertisements', data),
  getAll: (params) => api.get('/advertisements', { params }),
  getById: (id) => api.get(`/advertisements/${id}`),
  update: (id, data) => api.put(`/advertisements/${id}`, data),
  delete: (id) => api.delete(`/advertisements/${id}`),
  getPlacements: () => api.get('/advertisements/placements'),
};

export const refundApi = {
  getAll: (params) => api.get('/refunds', { params }),
  create: (data) => api.post('/refunds', data),
  update: (id, data) => api.put(`/refunds/${id}`, data),
};

export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
};

export const campaignApi = {
  create: (data) => api.post('/campaigns', data),
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  addAd: (campaignId, data) => api.post(`/campaigns/${campaignId}/ads`, data),
};

export const timeSlotApi = {
  getAll: () => api.get('/time-slots'),
  create: (data) => api.post('/time-slots', data),
  update: (id, data) => api.put(`/time-slots/${id}`, data),
  delete: (id) => api.delete(`/time-slots/${id}`),
};

export const paymentApi = {
  getAll: (params) => api.get('/payments', { params }),
  getInvoice: (bookingId) => api.get(`/payments/invoice/booking/${bookingId}`),
  getAdInvoice: (adId) => api.get(`/payments/invoice/ad/${adId}`),
  processPayment: (paymentData) => api.post('/payments', paymentData),
};

export const trackingApi = {
  getTasks: () => api.get('/tracking/tasks'),
  getHistory: (bookingId) => api.get(`/tracking/history/${bookingId}`),
};

export const feedbackApi = {
  create: (data) => api.post('/feedbacks', data),
  getAll: (params) => api.get('/feedbacks', { params }),
  update: (id, data) => api.put(`/feedbacks/${id}`, data),
  delete: (id) => api.delete(`/feedbacks/${id}`),
};

export const complaintApi = {
  create: (data) => api.post('/complaints', data),
  getAll: (params) => api.get('/complaints', { params }),
  update: (id, data) => api.put(`/complaints/${id}`, data),
};

export default api;
