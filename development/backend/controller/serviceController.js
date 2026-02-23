const pool = require('../config/database');

const addService = async (req, res) => {

  const {
    serviceName,
    serviceDescription,
    serviceDuration,
    servicePrice,
    serviceCategoryId
  } = req.body;

  try {

    if (!serviceName || !serviceDuration || !servicePrice) {
      return res.status(400).json({
        success: false,
        error: 'serviceName, serviceDuration, and servicePrice are required.'
      });
    }

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

    const result = await pool.query(
      `INSERT INTO "service"
       ("serviceName", "serviceDescription", "serviceDuration", "servicePrice", "serviceCategoryId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceName, serviceDescription, serviceDuration, servicePrice, serviceCategoryId]
    );

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

const viewService = async (req, res) => {

  const { serviceId } = req.params;

  try {

    const result = await pool.query(
      `SELECT s.*, sc."serviceCategoryName"
       FROM "service" s
       LEFT JOIN "serviceCategory" sc ON s."serviceCategoryId" = sc."serviceCategoryId"
       WHERE s."serviceId" = $1`,
      [serviceId]
    );

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

const viewAllService = async (req, res) => {
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

const deleteService = async (req, res) => {
  const { serviceId } = req.params;

  try {

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

module.exports = {
  addService,
  viewService,
  viewAllService,
  updateService,
  deleteService
};
