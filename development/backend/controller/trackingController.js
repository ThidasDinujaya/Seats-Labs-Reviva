const pool = require('../config/database');

// ============================================================
// trackingController.js
// PURPOSE: Handles tracking of service progress and technician tasks.
// ============================================================

/**
 * @desc Get all active tracking tasks for manager view
 * @route GET /api/tracking/tasks
 */
const getTask = async (req, res) => {
  try {
    const query = `
      SELECT 
        b."bookingId",
        b."bookingStatus",
        b."bookingStartTime",
        b."bookingEndTime",
        s."serviceName",
        t."technicianFirstName",
        t."technicianLastName",
        st."serviceTrackingStatus",
        st."serviceTrackingCreatedAt" as "lastUpdate"
      FROM "booking" b
      JOIN "service" s ON b."serviceId" = s."serviceId"
      LEFT JOIN "technician" t ON b."technicianId" = t."technicianId"
      LEFT JOIN LATERAL (
        SELECT "serviceTrackingStatus", "serviceTrackingCreatedAt"
        FROM "serviceTracking"
        WHERE "bookingId" = b."bookingId"
        ORDER BY "serviceTrackingCreatedAt" DESC
        LIMIT 1
      ) st ON true
      WHERE b."technicianId" IS NOT NULL
      AND b."bookingStatus" NOT IN ('pending', 'cancelled', 'rejected')
      ORDER BY b."bookingDate" DESC, b."bookingStartTime" ASC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get tracking tasks error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch tracking tasks.' });
  }
};

/**
 * @desc Get tracking history for a specific booking
 * @route GET /api/tracking/history/:bookingId
 */
const getHistory = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const query = `
      SELECT * FROM "serviceTracking"
      WHERE "bookingId" = $1
      ORDER BY "serviceTrackingCreatedAt" ASC
    `;
    const result = await pool.query(query, [bookingId]);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get booking tracking history error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch tracking history.' });
  }
};

/**
 * @desc Update tracking status for a booking
 * @route POST /api/tracking/update
 */
const updateStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    if (!bookingId || !status) {
      return res.status(400).json({ success: false, error: 'bookingId and status are required.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert new tracking record
      await client.query(
        `INSERT INTO "serviceTracking" ("serviceTrackingStatus", "bookingId") VALUES ($1, $2)`,
        [status, bookingId]
      );

      // If status is 'completed', update the booking status to 'completed' as well
      if (status === 'completed') {
        await client.query(
          `UPDATE "booking" SET "bookingStatus" = 'completed' WHERE "bookingId" = $1`,
          [bookingId]
        );
      } else if (status === 'started' || status === 'in_progress') {
        await client.query(
          `UPDATE "booking" SET "bookingStatus" = 'in_progress' WHERE "bookingId" = $1`,
          [bookingId]
        );
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: `Status updated to ${status}`
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update tracking status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update tracking status.' });
  }
};

module.exports = {
  getTask,
  getHistory,
  updateStatus
};
