// ============================================================
// controllers/feedbackController.js
// PURPOSE: CRUD #6 - Customer feedback and rating operations.
// CRUD OPERATIONS:
//   1. addFeedback      - POST   /api/feedbacks
//   2. viewFeedback     - GET    /api/feedbacks/:feedbackId
//   3. viewAllFeedback  - GET    /api/feedback
//   4. updateFeedback   - PUT    /api/feedbacks/:feedbackId
//   5. deleteFeedback   - DELETE /api/feedbacks/:feedbackId
// ============================================================

const pool = require('../config/database');

// ============================================================
// 1. ADD FEEDBACK - Customer rates a completed service
// POST /api/feedback
// WHO CAN USE: Customer
// ============================================================
// THINKING: Feedback can only be added for a COMPLETED booking.
// One booking can have only one feedback (enforced by UNIQUE constraint).
// ============================================================
const addFeedback = async (req, res) => {
  const {
    feedbackRating,       // 1-5 stars
    feedbackComment,      // Optional text review
    customerId,   // The customer giving feedback
    bookingId,    // The booking being rated
    technicianId  // The technician being rated (optional)
  } = req.body;

  try {
    // Validate required fields
    if (!feedbackRating || !customerId || !bookingId) {
      return res.status(400).json({
        success: false,
        error: 'feedbackRating, customerId, and bookingId are required.'
      });
    }

    // Validate rating range (1-5)
    if (feedbackRating < 1 || feedbackRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'feedbackRating must be between 1 and 5.'
      });
    }

    // Check if booking exists and is completed
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

    // Check if feedback already exists for this booking
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

    // Insert feedback
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

// ============================================================
// 2. VIEW FEEDBACK
// GET /api/feedback/:feedbackId
// ============================================================
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

// ============================================================
// 3. VIEW ALL FEEDBACKS
// GET /api/feedback?customerId=1&technicianId=2
// ============================================================
const viewAllFeedback = async (req, res) => {
  const { customerId, technicianId } = req.query;

  try {
    let query = `
      SELECT f.*,
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

// ============================================================
// 4. UPDATE FEEDBACK
// PUT /api/feedback/:feedbackId
// ============================================================
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

// ============================================================
// 5. DELETE FEEDBACK
// DELETE /api/feedback/:feedbackId
// ============================================================
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