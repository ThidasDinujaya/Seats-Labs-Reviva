// ============================================================
// routes/authRoutes.js
// PURPOSE: Authentication API routes (register, login)
// ============================================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controller/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         userEmail:
 *           type: string
 *         userRole:
 *           type: string
 *           enum: [customer, advertiser, technician, admin]
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userEmail
 *               - userPassword
 *               - userRole
 *             properties:
 *               userEmail:
 *                 type: string
 *                 example: john@example.com
 *               userPassword:
 *                 type: string
 *                 example: password123
 *               userRole:
 *                 type: string
 *                 enum: [customer, advertiser]
 *                 example: customer
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: 0771234567
 *               address:
 *                 type: string
 *                 example: 123 Main St, Colombo
 *               businessName:
 *                 type: string
 *                 description: Required for advertisers
 *               contactPerson:
 *                 type: string
 *                 description: Required for advertisers
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userEmail
 *               - userPassword
 *             properties:
 *               userEmail:
 *                 type: string
 *                 example: john@example.com
 *               userPassword:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, getMe);

module.exports = router;
