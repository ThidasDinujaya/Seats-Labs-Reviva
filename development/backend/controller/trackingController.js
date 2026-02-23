const pool = require('../config/database');

const getServiceTracking = async (req, res) => {
  try {
    const query = `
      SELECT
        st."serviceTrackingId",
        st."serviceTrackingStatus",
        st."serviceTrackingCreatedAt",
        b."bookingId",
        b."bookingStatus",
        b."bookingStartTime",
        b."bookingEndTime",
        b."bookingRefNumber",
        b."customerId",
        b."vehicleId",
        b."serviceId",
        b."technicianId",
        b."timeSlotId",
        s."serviceName",
        t."technicianFirstName",
        t."technicianLastName"
      FROM "serviceTracking" st
      JOIN "booking" b ON st."bookingId" = b."bookingId"
      JOIN "service" s ON b."serviceId" = s."serviceId"
      LEFT JOIN "technician" t ON b."technicianId" = t."technicianId"
      WHERE 1=1
      AND b."bookingStatus" NOT IN ('pending', 'cancelled', 'rejected')
      ORDER BY st."serviceTrackingCreatedAt" DESC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get service tracking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch service tracking data.' });
  }
};

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

const updateStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    if (!bookingId || !status) {
      return res.status(400).json({ success: false, error: 'bookingId and status are required.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO "serviceTracking" ("serviceTrackingStatus", "bookingId") VALUES ($1, $2)`,
        [status, bookingId]
      );

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
  getServiceTracking,
  getHistory,
  updateStatus
};
