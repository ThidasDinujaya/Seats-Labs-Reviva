const pool = require('../config/database');

// ============================================================
// controller/refundController.js
// PURPOSE: Handle refund operations.
// ============================================================

/**
 * @desc Get all refunds for manager view
 * @route GET /api/refunds
 */
const viewAllRefund = async (req, res) => {
  try {
    const query = `
      SELECT r."refundId", r."refundAmount", r."refundReason", r."refundStatus", r."refundDate", r."invoiceId", r."refundCreatedAt",
             i."invoiceNumber", 
             COALESCE(c."customerFirstName" || ' ' || c."customerLastName", adv."advertiserBusinessName") as "clientName"
      FROM "refund" r
      JOIN "invoice" i ON r."invoiceId" = i."invoiceId"
      LEFT JOIN "booking" b ON i."bookingId" = b."bookingId"
      LEFT JOIN "customer" c ON b."customerId" = c."customerId"
      LEFT JOIN "advertisement" a ON i."advertisementId" = a."advertisementId"
      LEFT JOIN "advertiser" adv ON a."advertiserId" = adv."advertiserId"
      ORDER BY r."refundCreatedAt" DESC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all refunds error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch refunds.' });
  }
};

/**
 * @desc Update refund status (complete/reject)
 * @route PUT /api/refunds/:refundId
 */
const updateRefundStatus = async (req, res) => {
  const { refundId } = req.params;
  const { refundStatus } = req.body;

  try {
    if (!refundId || isNaN(parseInt(refundId))) {
      return res.status(400).json({ success: false, error: 'Valid refundId is required.' });
    }

    if (!['completed', 'rejected'].includes(refundStatus)) {
        return res.status(400).json({ success: false, error: 'Invalid refund status. Must be completed or rejected.' });
    }

    // Start a transaction to ensure both refund and invoice are updated atomically
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE "refund" SET "refundStatus" = $1, "refundDate" = CURRENT_TIMESTAMP
         WHERE "refundId" = $2 RETURNING *`,
        [refundStatus, parseInt(refundId)]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Refund not found.' });
      }

      const refund = result.rows[0];

      // If refund is completed, update the corresponding invoice status to 'refunded'
      if (refundStatus === 'completed') {
          await client.query(
              `UPDATE "invoice" SET "invoiceStatus" = 'refunded' WHERE "invoiceId" = $1`,
              [refund.invoiceId]
          );
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        data: refund
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update refund status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update refund status: ' + error.message });
  }
};

module.exports = { viewAllRefund, updateRefundStatus };
