const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  generateDailyBookingReport,
  generateRevenueReport,
  generateTechnicianPerformanceReport,
  generateAdPerformanceReport
} = require('../controller/reportController');

router.get('/dailyBooking', authMiddleware, authorizeRole('admin', 'manager'), generateDailyBookingReport);

router.get('/revenueAnalysis', authMiddleware, authorizeRole('admin', 'manager'), generateRevenueReport);

router.get('/technicianPerformance', authMiddleware, authorizeRole('admin', 'manager'), generateTechnicianPerformanceReport);

router.get('/adPerformance', authMiddleware, authorizeRole('admin', 'manager'), generateAdPerformanceReport);

module.exports = router;
