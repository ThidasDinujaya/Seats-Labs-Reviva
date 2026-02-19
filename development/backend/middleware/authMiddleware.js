// ============================================================
// middleware/authMiddleware.js
// PURPOSE: Protects API routes by verifying JWT tokens.
// LOGIC: When a request comes in, this middleware:
//   1. Extracts the JWT token from the Authorization header
//   2. Verifies the token is valid using the secret key
//   3. Attaches the decoded user data to the request object
//   4. If token is invalid/missing, returns 401 Unauthorized
// ============================================================

const jwt = require('jsonwebtoken');  // Library for JWT operations
require('dotenv').config();

// Main authentication middleware function
// THINKING: This runs BEFORE the actual route handler.
// Express middleware receives (req, res, next).
// Call next() to pass control to the next middleware/handler.
const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get the token from the "Authorization" header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // If no Authorization header exists, reject the request
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Step 2: Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Step 3: Verify the token using our secret key
    // jwt.verify() will throw an error if token is invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach decoded user info to the request
    // Now any route handler can access req.user
    req.user = decoded;

    // Step 5: Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
};

// Role-based authorization middleware
// THINKING: After authentication, we may also need to check
// if the user has the right ROLE to access a resource.
// This is a higher-order function that returns a middleware.
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if the authenticated user's role is in the allowed list
    if (!allowedRoles.includes(req.user.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRole };