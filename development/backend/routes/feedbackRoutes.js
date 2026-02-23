const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addFeedback,
  viewFeedback,
  viewAllFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controller/feedbackController');

router.post('/', authMiddleware, addFeedback);

router.get('/', authMiddleware, viewAllFeedback);

router.get('/:feedbackId', authMiddleware, viewFeedback);

router.put('/:feedbackId', authMiddleware, updateFeedback);

router.delete('/:feedbackId', authMiddleware, deleteFeedback);

module.exports = router;
