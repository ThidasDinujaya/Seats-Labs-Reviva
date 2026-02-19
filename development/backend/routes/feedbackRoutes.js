// ============================================================
// routes/feedbackRoutes.js
// PURPOSE: Feedback and rating API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addFeedback,
  viewFeedback,
  viewAllFeedbacks,
  updateFeedback,
  deleteFeedback
} = require('../controller/feedbackController');

/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Add feedback for a completed booking
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedbackRating
 *               - feedbackCustomerId
 *               - feedbackBookingId
 *             properties:
 *               feedbackRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               feedbackComment:
 *                 type: string
 *                 example: Excellent service!
 *               feedbackCustomerId:
 *                 type: integer
 *               feedbackBookingId:
 *                 type: integer
 *               feedbackTechnicianId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Feedback created successfully
 */
router.post('/', authMiddleware, addFeedback);

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: Get all feedbacks with optional filters
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of feedbacks
 */
router.get('/', authMiddleware, viewAllFeedbacks);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feedback details
 */
router.get('/:feedbackId', authMiddleware, viewFeedback);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   put:
 *     summary: Update feedback
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedbackRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedbackComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 */
router.put('/:feedbackId', authMiddleware, updateFeedback);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   delete:
 *     summary: Delete feedback
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 */
router.delete('/:feedbackId', authMiddleware, deleteFeedback);

module.exports = router;
