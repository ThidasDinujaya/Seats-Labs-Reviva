// ============================================================
// routes/paymentRoutes.js
// PURPOSE: Payment management API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  createPayment,
  getInvoiceByBookingId,
  getInvoiceByAdId,
  getAllPayment,
  getAdvertiserPayment
} = require('../controller/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management operations
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a new payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - paymentAmount
 *               - paymentMethod
 *             properties:
 *               invoiceId:
 *                 type: integer
 *               paymentAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *   get:
 *     summary: Get all payments (Manager only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments retrieved
 */
router.post('/', authMiddleware, createPayment);
router.get('/', authMiddleware, authorizeRole('manager', 'admin'), getAllPayment);
router.get('/my', authMiddleware, authorizeRole('manager', 'advertiser'), getAdvertiserPayment);

/**
 * @swagger
 * /api/payments/invoice/booking/{bookingId}:
 *   get:
 *     summary: Get invoice details by booking ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details retrieved
 *       404:
 *         description: Invoice not found
 */
router.get('/invoice/booking/:bookingId', authMiddleware, getInvoiceByBookingId);
router.get('/invoice/advertisement/:advertisementId', authMiddleware, getInvoiceByAdId);

module.exports = router;
