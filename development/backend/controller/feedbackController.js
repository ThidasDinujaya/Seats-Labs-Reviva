const pool = require('../config/database');

const addFeedback = async (req, res) => {
  const {
    feedbackRating,
    feedbackComment,
    customerId,
    bookingId,
    technicianId
  } = req.body;

  try {

    if (!feedbackRating || !customerId || !bookingId) {
      return res.status(400).json({
        success: false,
        error: 'feedbackRating, customerId, and bookingId are required.'
      });
    }

    if (feedbackRating < 1 || feedbackRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'feedbackRating must be between 1 and 5.'
      });
    }

    const bookingResult = await pool.query(
      'SELECT "bookingStatus" FROM "booking" WHERE "bookingId" = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (bookingResult.rows[0].bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Feedback can only be given for completed bookings.'
      });
    }

    const existingFeedback = await pool.query(
      'SELECT "feedbackId" FROM "feedback" WHERE "bookingId" = $1',
      [bookingId]
    );

    if (existingFeedback.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already exists for this booking.'
      });
    }

    const result = await pool.query(
      `INSERT INTO "feedback"
       ("feedbackRating", "feedbackComment", "customerId",
        "bookingId", "technicianId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [feedbackRating, feedbackComment, customerId,
       bookingId, technicianId]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add feedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add feedback.' });
  }
};

const viewFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const result = await pool.query(
      `SELECT f.*,
        c."customerFirstName", c."customerLastName",
        s."serviceName",
        p."servicePackageName",
        t."technicianFirstName", t."technicianLastName"
       FROM "feedback" f
       JOIN "customer" c ON f."customerId" = c."customerId"
       JOIN "booking" b ON f."bookingId" = b."bookingId"
       LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "servicePackage" p ON b."servicePackageId" = p."servicePackageId"
       LEFT JOIN "technician" t ON f."technicianId" = t."technicianId"
       WHERE f."feedbackId" = $1`,
      [feedbackId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('View feedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
};

const viewAllFeedback = async (req, res) => {
  const { customerId, technicianId } = req.query;

  try {
    let query = `
      SELECT f."feedbackId", f."feedbackRating", f."feedbackComment", f."customerId", f."bookingId", f."technicianId", f."feedbackCreatedAt",
        c."customerFirstName", c."customerLastName",
        s."serviceName",
        p."servicePackageName",
        t."technicianFirstName", t."technicianLastName"
      FROM "feedback" f
      JOIN "customer" c ON f."customerId" = c."customerId"
      JOIN "booking" b ON f."bookingId" = b."bookingId"
      LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
      LEFT JOIN "servicePackage" p ON b."servicePackageId" = p."servicePackageId"
      LEFT JOIN "technician" t ON f."technicianId" = t."technicianId"
      WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    if (customerId) {
      query += ` AND f."customerId" = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }
    if (technicianId) {
      query += ` AND f."technicianId" = $${paramIndex}`;
      params.push(technicianId);
      paramIndex++;
    }

    query += ' ORDER BY f."feedbackCreatedAt" DESC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all feedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
};

const updateFeedback = async (req, res) => {
  const { feedbackId } = req.params;
  const { feedbackRating, feedbackComment } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM "feedback" WHERE "feedbackId" = $1',
      [feedbackId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found.' });
    }

    if (feedbackRating && (feedbackRating < 1 || feedbackRating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'feedbackRating must be between 1 and 5.'
      });
    }

    const result = await pool.query(
      `UPDATE "feedback" SET
        "feedbackRating" = COALESCE($1, "feedbackRating"),
        "feedbackComment" = COALESCE($2, "feedbackComment")
       WHERE "feedbackId" = $3
       RETURNING *`,
      [feedbackRating, feedbackComment, feedbackId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update feedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update feedback.' });
  }
};

const deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM "feedback" WHERE "feedbackId" = $1',
      [feedbackId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found.' });
    }

    await pool.query('DELETE FROM "feedback" WHERE "feedbackId" = $1', [feedbackId]);

    return res.status(200).json({
      success: true,
      data: { message: 'Feedback deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete feedback.' });
  }
};

module.exports = { addFeedback, viewFeedback, viewAllFeedback, updateFeedback, deleteFeedback };
