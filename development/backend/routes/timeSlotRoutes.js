// ============================================================
// routes/timeSlotRoutes.js
// ============================================================
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addTimeSlot,
  viewAllTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} = require('../controller/timeSlotController');

/**
 * @swagger
 * /api/time-slots:
 *   get:
 *     summary: Get all active time slots
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of time slots
 */
router.get('/', authMiddleware, viewAllTimeSlot);

/**
 * @swagger
 * /api/time-slots:
 *   post:
 *     summary: Add a new time slot
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotStartTime
 *               - slotEndTime
 *             properties:
 *               slotStartTime:
 *                 type: string
 *                 example: "08:00"
 *               slotEndTime:
 *                 type: string
 *                 example: "09:00"
 *               slotMaxCapacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Slot created
 */
router.post('/', authMiddleware, authorizeRole('manager', 'admin'), addTimeSlot);

/**
 * @swagger
 * /api/time-slots/{timeSlotId}:
 *   put:
 *     summary: Update a time slot
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeSlotId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Slot updated
 */
router.put('/:timeSlotId', authMiddleware, authorizeRole('manager', 'admin'), updateTimeSlot);

/**
 * @swagger
 * /api/time-slots/{timeSlotId}:
 *   delete:
 *     summary: Delete (deactivate) a time slot
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeSlotId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slot deleted
 */
router.delete('/:timeSlotId', authMiddleware, authorizeRole('manager', 'admin'), deleteTimeSlot);

module.exports = router;
