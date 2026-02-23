const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  viewCustomer,
  viewAllCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controller/customerController');

router.get('/', authMiddleware, authorizeRole('admin'), viewAllCustomer);

router.get('/:customerId', authMiddleware, viewCustomer);

router.put('/:customerId', authMiddleware, updateCustomer);

router.delete('/:customerId', authMiddleware, authorizeRole('admin'), deleteCustomer);

module.exports = router;
