const express = require('express');
const router = express.Router();
const trackingController = require('../controller/trackingController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these exist

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: Service progress tracking and technician tasks
 */

/**
 * @swagger
 * /api/tracking/tasks:
 *   get:
 *     summary: Get all active technician tasks (Manager only)
 *     tags: [Tracking]
 *     responses:
 *       200:
 *         description: List of active tasks
 */
router.get('/tasks', trackingController.getTrackingTasks);

/**
 * @swagger
 * /api/tracking/history/{bookingId}:
 *   get:
 *     summary: Get tracking history for a booking
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of history records
 */
router.get('/history/:bookingId', trackingController.getBookingTrackingHistory);
router.post('/update', trackingController.updateTrackingStatus);

module.exports = router;
