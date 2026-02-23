const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addTimeSlot,
  viewAllTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} = require('../controller/timeSlotController');

router.get('/', authMiddleware, viewAllTimeSlot);

router.post('/', authMiddleware, authorizeRole('manager', 'admin'), addTimeSlot);

router.put('/:timeSlotId', authMiddleware, authorizeRole('manager', 'admin'), updateTimeSlot);

router.delete('/:timeSlotId', authMiddleware, authorizeRole('manager', 'admin'), deleteTimeSlot);

module.exports = router;
