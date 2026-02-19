// ============================================================
// routes/customerRoutes.js
// PURPOSE: Customer management API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  viewCustomer,
  viewAllCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controller/customerController');

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers (Admin only)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', authMiddleware, authorizeRole('admin'), viewAllCustomer);

/**
 * @swagger
 * /api/customers/{customerId}:
 *   get:
 *     summary: Get customer profile with vehicles
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get('/:customerId', authMiddleware, viewCustomer);

/**
 * @swagger
 * /api/customers/{customerId}:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerFirstName:
 *                 type: string
 *               customerLastName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               customerAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.put('/:customerId', authMiddleware, updateCustomer);

/**
 * @swagger
 * /api/customers/{customerId}:
 *   delete:
 *     summary: Delete customer (soft delete)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.delete('/:customerId', authMiddleware, authorizeRole('admin'), deleteCustomer);

module.exports = router;
