const express = require('express');
const router = express.Router();
const refundController = require('../controller/refundController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Refund
 *   description: Refund management operations
 */

/**
 * @swagger
 * /api/refunds:
 *   get:
 *     summary: Get all refunds
 *     tags: [Refund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of refunds
 */
router.get('/', authMiddleware, refundController.viewAllRefund);

/**
 * @swagger
 * /api/refunds/{refundId}:
 *   put:
 *     summary: Update refund status
 *     tags: [Refund]
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refundStatus
 *             properties:
 *               refundStatus:
 *                 type: string
 *                 enum: [pending, completed, rejected]
 *     responses:
 *       200:
 *         description: Refund status updated
 */
router.put('/:refundId', authMiddleware, refundController.updateRefundStatus);

module.exports = router;
