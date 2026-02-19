// ============================================================
// routes/bookingRoutes.js
// PURPOSE: Booking management API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addBooking,
  viewBooking,
  viewAllBookings,
  updateBooking,
  cancelBooking
} = require('../controller/bookingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         bookingId:
 *           type: integer
 *         bookingDate:
 *           type: string
 *           format: date
 *         bookingStartTime:
 *           type: string
 *         bookingEndTime:
 *           type: string
 *         bookingStatus:
 *           type: string
 *           enum: [pending, accepted, in_progress, completed, cancelled, rejected]
 *         bookingRefNumber:
 *           type: string
 *         bookingNotes:
 *           type: string
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingDate
 *               - timeSlotId
 *               - customerId
 *               - vehicleId
 *               - serviceId
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-03-15
 *               timeSlotId:
 *                 type: integer
 *                 example: 1
 *               bookingNotes:
 *                 type: string
 *                 example: Please check brakes as well
 *               customerId:
 *                 type: integer
 *                 example: 1
 *               vehicleId:
 *                 type: integer
 *                 example: 1
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error or capacity reached
 */
router.post('/', authMiddleware, addBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings with optional filters
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by booking status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by booking date
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: integer
 *         description: Filter by technician ID
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', authMiddleware, viewAllBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
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
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:bookingId', authMiddleware, viewBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingStatus:
 *                 type: string
 *               technicianId:
 *                 type: integer
 *               bookingDate:
 *                 type: string
 *                 format: date
 *               timeSlotId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put('/:bookingId', authMiddleware, updateBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
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
 *         description: Booking cancelled successfully
 */
router.delete('/:bookingId', authMiddleware, cancelBooking);

module.exports = router;
