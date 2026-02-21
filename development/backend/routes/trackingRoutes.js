const express = require('express');
const router = express.Router();
const trackingController = require('../controller/trackingController');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these exist

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: Service progress tracking
 */

/**
 * @swagger
 * /api/tracking:
 *   get:
 *     summary: Get all active service tracking records (Manager only)
 *     tags: [Tracking]
 *     responses:
 *       200:
 *         description: List of tracks
 */
router.get('/', trackingController.getServiceTracking);

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
router.get('/history/:bookingId', trackingController.getHistory);
router.post('/update', trackingController.updateStatus);

module.exports = router;
