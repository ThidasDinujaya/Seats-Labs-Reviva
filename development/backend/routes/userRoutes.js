const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  getAllUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controller/userController');

// Define routes
router.get('/', authMiddleware, authorizeRole('manager', 'admin'), getAllUser);
router.post('/', authMiddleware, authorizeRole('manager', 'admin'), createUser);
router.put('/:id', authMiddleware, authorizeRole('manager', 'admin'), updateUser);
router.delete('/:id', authMiddleware, authorizeRole('manager', 'admin'), deleteUser);

module.exports = router;
