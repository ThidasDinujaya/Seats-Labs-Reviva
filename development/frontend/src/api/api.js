import axios from 'axios';

// ============================================================
// src/api/api.js
// PURPOSE: Axios instance and API helper methods
// NAMING: All API paths use singular nouns to match the backend
// ============================================================

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
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

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error.message);
  }
);

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  login:    (credentials) => api.post('/auth/login', credentials),
  register: (userData)    => api.post('/auth/register', userData),
  getMe:    ()            => api.get('/auth/me'),
};

// ============================================================
// SERVICE  (singular: /api/service)
// ============================================================
export const serviceApi = {
  getAll:          ()           => api.get('/service'),
  getById:         (id)         => api.get(`/service/${id}`),
  create:          (data)       => api.post('/service', data),
  update:          (id, data)   => api.put(`/service/${id}`, data),
  delete:          (id)         => api.delete(`/service/${id}`),

  // Category sub-resource
  getCategory:   ()           => api.get('/service/category/all'),
  createCategory:  (data)       => api.post('/service/category', data),
  updateCategory:  (id, data)   => api.put(`/service/category/${id}`, data),
  deleteCategory:  (id)         => api.delete(`/service/category/${id}`),

  // Package sub-resource
  getPackage:     ()           => api.get('/service/package/all'),
  createPackage:   (data)       => api.post('/service/package', data),
  updatePackage:   (id, data)   => api.put(`/service/package/${id}`, data),
  deletePackage:   (id)         => api.delete(`/service/package/${id}`),
};

// ============================================================
// BOOKING  (singular: /api/booking)
// ============================================================
export const bookingApi = {
  create:  (data)       => api.post('/booking', data),
  getAll:  (params)     => api.get('/booking', { params }),
  getById: (id)         => api.get(`/booking/${id}`),
  update:  (id, data)   => api.put(`/booking/${id}`, data),
  cancel:  (id)         => api.delete(`/booking/${id}`),
};

// ============================================================
// TECHNICIAN  (singular: /api/technician)
// ============================================================
export const technicianApi = {
  getAll: () => api.get('/technician'),
};

// ============================================================
// REPORT  (singular: /api/report)
// ============================================================
export const reportApi = {
  getDailyBookingReport:   (date)                    => api.get('/report/dailyBooking',         { params: { date } }),
  getRevenueAnalysis:      (startDate, endDate)      => api.get('/report/revenueAnalysis',       { params: { startDate, endDate } }),
  getTechnicianPerformance:(startDate, endDate)      => api.get('/report/technicianPerformance', { params: { startDate, endDate } }),
  getCustomerSatisfaction: (startDate, endDate)      => api.get('/report/customerSatisfaction',  { params: { startDate, endDate } }),
  getAdPerformance:        (startDate, endDate)      => api.get('/report/adPerformance',         { params: { startDate, endDate } }),
};

// ============================================================
// USER  (singular: /api/user)
// ============================================================
export const userApi = {
  getAll: ()           => api.get('/user'),
  create: (data)       => api.post('/user', data),
  update: (id, data)   => api.put(`/user/${id}`, data),
  delete: (id)         => api.delete(`/user/${id}`),
};

// ============================================================
// ADVERTISEMENT  (singular: /api/advertisement)
// ============================================================
export const advertisementApi = {
  create:        (data)       => api.post('/advertisement', data),
  getAll:        (params)     => api.get('/advertisement', { params }),
  getById:       (id)         => api.get(`/advertisement/${id}`),
  update:        (id, data)   => api.put(`/advertisement/${id}`, data),
  delete:        (id)         => api.delete(`/advertisement/${id}`),
  getPlacements: ()           => api.get('/advertisement/placement'),
};

// ============================================================
// REFUND  (singular: /api/refund)
// ============================================================
export const refundApi = {
  getAll: (params)     => api.get('/refund', { params }),
  create: (data)       => api.post('/refund', data),
  update: (id, data)   => api.put(`/refund/${id}`, data),
};

// ============================================================
// SETTING  (singular: /api/setting)
// ============================================================
export const settingsApi = {
  getAll:   ()            => api.get('/setting'),
  getByKey: (key)         => api.get(`/setting/${key}`),
  update:   (key, value)  => api.put(`/setting/${key}`, { value }),
};

// ============================================================
// CAMPAIGN  (singular: /api/campaign)
// ============================================================
export const campaignApi = {
  create:  (data)              => api.post('/campaign', data),
  getAll:  (params)            => api.get('/campaign', { params }),
  getById: (id)                => api.get(`/campaign/${id}`),
  update:  (id, data)          => api.put(`/campaign/${id}`, data),
  delete:  (id)                => api.delete(`/campaign/${id}`),
  addAd:   (campaignId, data)  => api.post(`/campaign/${campaignId}/advertisement`, data),
};

// ============================================================
// TIME SLOT  (singular: /api/time-slot)
// ============================================================
export const timeSlotApi = {
  getAll: ()           => api.get('/time-slot'),
  create: (data)       => api.post('/time-slot', data),
  update: (id, data)   => api.put(`/time-slot/${id}`, data),
  delete: (id)         => api.delete(`/time-slot/${id}`),
};

// ============================================================
// PAYMENT  (singular: /api/payment)
// ============================================================
export const paymentApi = {
  getAll:         (params)       => api.get('/payment', { params }),
  getInvoice:     (bookingId)    => api.get(`/payment/invoice/booking/${bookingId}`),
  getAdInvoice:   (adId)         => api.get(`/payment/invoice/advertisement/${adId}`),
  getMyPayment:   ()             => api.get('/payment/my'),
  processPayment: (paymentData)  => api.post('/payment', paymentData),
};

// ============================================================
// TRACKING  (/api/tracking — already singular)
// ============================================================
export const trackingApi = {
  getTask:   ()          => api.get('/tracking/task'),
  getHistory: (bookingId) => api.get(`/tracking/history/${bookingId}`),
};

// ============================================================
// FEEDBACK  (singular: /api/feedback)
// ============================================================
export const feedbackApi = {
  create:  (data)       => api.post('/feedback', data),
  getAll:  (params)     => api.get('/feedback', { params }),
  update:  (id, data)   => api.put(`/feedback/${id}`, data),
  delete:  (id)         => api.delete(`/feedback/${id}`),
};

// ============================================================
// COMPLAINT  (singular: /api/complaint)
// ============================================================
export const complaintApi = {
  create:  (data)       => api.post('/complaint', data),
  getAll:  (params)     => api.get('/complaint', { params }),
  update:  (id, data)   => api.put(`/complaint/${id}`, data),
};

export default api;
