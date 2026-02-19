// ============================================================
// server.js
// PURPOSE: Main Express server with Swagger API documentation
// LOGIC: Sets up Express app, middleware, routes, and Swagger UI
// ============================================================

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import database connection to test on startup
const pool = require('./config/database');

// Import all route modules
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const refundRoutes = require('./routes/refundRoutes');
const placementRoutes = require('./routes/placementRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

// ============================================================
// SWAGGER CONFIGURATION
// ============================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SeatsLabs API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for SeatsLabs Automotive Workshop Management System',
      contact: {
        name: 'SeatsLabs Team',
        email: 'support@seatslabs.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User registration and login' },
      { name: 'Services', description: 'Service management operations' },
      { name: 'Bookings', description: 'Booking management operations' },
      { name: 'Customers', description: 'Customer management operations' },
      { name: 'Technicians', description: 'Technician management operations' },
      { name: 'Feedbacks', description: 'Customer feedback and ratings' },
      { name: 'Advertisements', description: 'Advertisement management' },
      { name: 'Campaigns', description: 'Ad campaign management' },
      { name: 'Reports', description: 'Business reports and analytics' },
      { name: 'Time Slots', description: 'Time slot management' },
      { name: 'Payments', description: 'Payment management' }
    ]
  },
  apis: ['./routes/*.js'] // Path to route files with Swagger comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ============================================================
// EXPRESS APP SETUP
// ============================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
// CORS - Allow frontend to communicate with backend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser - Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================
// SWAGGER UI ROUTE
// ============================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SeatsLabs API Docs'
}));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/complaints', complaintRoutes);

// ============================================================
// ROOT ROUTE
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SeatsLabs API',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      bookings: '/api/bookings',
      customers: '/api/customers',
      technicians: '/api/technicians',
      feedbacks: '/api/feedbacks',
      advertisements: '/api/advertisements',
      campaigns: '/api/campaigns',
      reports: '/api/reports',
      timeSlots: '/api/time-slots'
    }
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('============================================================');
  console.log('🚀 SeatsLabs API Server Started');
  console.log('============================================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🗄️  Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log('============================================================');
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});
