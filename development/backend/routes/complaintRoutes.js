const express = require('express');
const router = express.Router();
const complaintController = require('../controller/complaintController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, complaintController.addComplaint);
router.get('/', authMiddleware, complaintController.getAllComplaints);
router.put('/:id', authMiddleware, complaintController.updateComplaint);

module.exports = router;
