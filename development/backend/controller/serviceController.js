// ============================================================
// controllers/serviceController.js
// PURPOSE: CRUD #1 - Service management operations.
// CRUD OPERATIONS:
//   1. addService     - POST   /api/services
//   2. viewService    - GET    /api/services/:serviceId
//   3. viewAllServices- GET    /api/services
//   4. updateService  - PUT    /api/services/:serviceId
//   5. deleteService  - DELETE /api/services/:serviceId
// ============================================================

const pool = require('../config/database');

// ============================================================
// 1. ADD SERVICE - Create a new service
// POST /api/services
// WHO CAN USE: Admin only
// ============================================================
// THINKING: When admin adds a new service, we need to:
// - Validate that all required fields are provided
// - Check if a service with the same name already exists
// - Insert the new service into the database
// - Return the created service
// ============================================================
const addService = async (req, res) => {
  // Extract service data from the request body
  const {
    serviceName,        // e.g., "Oil Change"
    serviceDescription, // e.g., "Complete oil change with filter"
    serviceDuration,    // e.g., 30 (minutes)
    servicePrice,       // e.g., 2500.00 (LKR)
    serviceCategoryId   // Foreign key to serviceCategory table
  } = req.body;

  try {
    // Validation: Check required fields
    if (!serviceName || !serviceDuration || !servicePrice) {
      return res.status(400).json({
        success: false,
        error: 'serviceName, serviceDuration, and servicePrice are required.'
      });
    }

    // Check if service name already exists
    const existing = await pool.query(
      'SELECT "serviceId" FROM "service" WHERE "serviceName" = $1',
      [serviceName]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A service with this name already exists.'
      });
    }

    // Insert the new service into the database
    // $1, $2, etc. are parameterized query placeholders
    // THINKING: Parameterized queries prevent SQL injection attacks
    const result = await pool.query(
      `INSERT INTO "service" 
       ("serviceName", "serviceDescription", "serviceDuration", "servicePrice", "serviceCategoryId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceName, serviceDescription, serviceDuration, servicePrice, serviceCategoryId]
    );

    // Return the newly created service with 201 status (Created)
    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add service error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add service.'
    });
  }
};

// ============================================================
// 2. VIEW SERVICE - Get a single service by ID
// GET /api/services/:serviceId
// WHO CAN USE: All authenticated users
// ============================================================
// THINKING: A simple SELECT query with JOIN to get category name.
// We use req.params.serviceId to get the ID from the URL.
// ============================================================
const viewService = async (req, res) => {
  // Get serviceId from URL parameter (e.g., /api/services/3)
  const { serviceId } = req.params;

  try {
    // Query: Join service with serviceCategory to get category name
    const result = await pool.query(
      `SELECT s.*, sc."serviceCategoryName"
       FROM "service" s
       LEFT JOIN "serviceCategory" sc ON s."serviceCategoryId" = sc."serviceCategoryId"
       WHERE s."serviceId" = $1`,
      [serviceId]
    );

    // If no service found with this ID
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('View service error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch service.'
    });
  }
};

// ============================================================
// 3. VIEW ALL SERVICES - Get list of all active services
// GET /api/services
// WHO CAN USE: All authenticated users
// ============================================================
// THINKING: Returns all services that are active (not soft-deleted).
// We JOIN with serviceCategory to include category names.
// We order by serviceName for consistent display.
// ============================================================
const viewAllServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, sc."serviceCategoryName"
       FROM "service" s
       LEFT JOIN "serviceCategory" sc ON s."serviceCategoryId" = sc."serviceCategoryId"
       WHERE s."serviceIsActive" = true
       ORDER BY s."serviceName" ASC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all services error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch services.'
    });
  }
};

// ============================================================
// 4. UPDATE SERVICE - Modify an existing service
// PUT /api/services/:serviceId
// WHO CAN USE: Admin only
// ============================================================
// THINKING: Update uses PUT method. We:
// 1. Check if the service exists
// 2. Update only the fields that were provided
// 3. Return the updated service
// ============================================================
const updateService = async (req, res) => {
  const { serviceId } = req.params;
  const {
    serviceName,
    serviceDescription,
    serviceDuration,
    servicePrice,
    serviceCategoryId,
    serviceIsActive
  } = req.body;

  try {
    // First, check if the service exists
    const existing = await pool.query(
      'SELECT * FROM "service" WHERE "serviceId" = $1',
      [serviceId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found.'
      });
    }

    // Update the service with new values
    // COALESCE: If new value is null/undefined, keep the old value
    const result = await pool.query(
      `UPDATE "service" SET
        "serviceName" = COALESCE($1, "serviceName"),
        "serviceDescription" = COALESCE($2, "serviceDescription"),
        "serviceDuration" = COALESCE($3, "serviceDuration"),
        "servicePrice" = COALESCE($4, "servicePrice"),
        "serviceCategoryId" = COALESCE($5, "serviceCategoryId"),
        "serviceIsActive" = COALESCE($6, "serviceIsActive")
       WHERE "serviceId" = $7
       RETURNING *`,
      [serviceName, serviceDescription, serviceDuration, servicePrice, serviceCategoryId, serviceIsActive, serviceId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update service error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update service.'
    });
  }
};

// ============================================================
// 5. DELETE SERVICE - Soft delete a service
// DELETE /api/services/:serviceId
// WHO CAN USE: Admin only
// ============================================================
// THINKING: We use "soft delete" - instead of actually removing
// the record, we set serviceIsActive to false. This way:
// - Past bookings still reference this service correctly
// - Admin can recover the service if needed
// - No data loss or broken foreign key references
// ============================================================
const deleteService = async (req, res) => {
  const { serviceId } = req.params;

  try {
    // Check if service exists
    const existing = await pool.query(
      'SELECT * FROM "service" WHERE "serviceId" = $1',
      [serviceId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found.'
      });
    }

    // Soft delete: Set serviceIsActive to false
    await pool.query(
      'UPDATE "service" SET "serviceIsActive" = false WHERE "serviceId" = $1',
      [serviceId]
    );

    return res.status(200).json({
      success: true,
      data: { message: 'Service deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete service.'
    });
  }
};

// Export all functions so routes can use them
module.exports = {
  addService,
  viewService,
  viewAllServices,
  updateService,
  deleteService
};