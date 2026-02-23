const express = require('express');
const router = express.Router();
const refundController = require('../controller/refundController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, refundController.viewAllRefund);

router.put('/:refundId', authMiddleware, refundController.updateRefundStatus);

module.exports = router;
