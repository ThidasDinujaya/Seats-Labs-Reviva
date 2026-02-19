// ============================================================
// routes/reportRoutes.js
// PURPOSE: Business report generation API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  generateDailyBookingReport,
  generateRevenueReport,
  generateTechnicianPerformanceReport,
  generateAdPerformanceReport
} = require('../controller/reportController');

/**
 * @swagger
 * /api/reports/dailyBooking:
 *   get:
 *     summary: Generate daily booking report (Admin & Manager)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-03-15
 *     responses:
 *       200:
 *         description: Daily booking report with status breakdown
 *       400:
 *         description: Date parameter required
 */
router.get('/dailyBooking', authMiddleware, authorizeRole('admin', 'manager'), generateDailyBookingReport);

/**
 * @swagger
 * /api/reports/revenueAnalysis:
 *   get:
 *     summary: Generate revenue analysis report (Admin & Manager)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-03-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-03-31
 *     responses:
 *       200:
 *         description: Revenue analysis with service and ad revenue breakdown
 */
router.get('/revenueAnalysis', authMiddleware, authorizeRole('admin', 'manager'), generateRevenueReport);

/**
 * @swagger
 * /api/reports/technicianPerformance:
 *   get:
 *     summary: Generate technician performance report (Admin & Manager)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Technician performance with workload and ratings
 */
router.get('/technicianPerformance', authMiddleware, authorizeRole('admin', 'manager'), generateTechnicianPerformanceReport);



/**
 * @swagger
 * /api/reports/adPerformance:
 *   get:
 *     summary: Generate ad performance report (Admin & Manager)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Ad performance with impressions, clicks, and CTR
 */
router.get('/adPerformance', authMiddleware, authorizeRole('admin', 'manager'), generateAdPerformanceReport);

module.exports = router;
