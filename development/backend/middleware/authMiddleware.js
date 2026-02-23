const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {

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
