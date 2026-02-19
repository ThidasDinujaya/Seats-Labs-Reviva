// ============================================================
// controllers/timeSlotController.js
// PURPOSE: Manage daily time slots (add, update, delete)
// ============================================================

const pool = require('../config/database');

// ============================================================
// 1. ADD TIME SLOT
// POST /api/time-slots
// WHO: Admin/Manager
// ============================================================
const addTimeSlot = async (req, res) => {
  const { timeSlotStartTime, timeSlotEndTime, timeSlotMaxCapacity } = req.body;

  try {
    if (!timeSlotStartTime || !timeSlotEndTime) {
      return res.status(400).json({ success: false, error: 'Start and End time are required.' });
    }

    const result = await pool.query(
      `INSERT INTO "timeSlot"
       ("timeSlotStartTime", "timeSlotEndTime", "timeSlotMaxCapacity")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [timeSlotStartTime, timeSlotEndTime, timeSlotMaxCapacity || 3]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: 'A slot with this start time already exists.' });
    }
    console.error('Add time slot error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add time slot.' });
  }
};

// ============================================================
// 2. VIEW ALL SLOTS
// GET /api/time-slots
// ============================================================
const viewAllTimeSlot = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "timeSlot" WHERE "timeSlotIsActive" = true ORDER BY "timeSlotStartTime" ASC'
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get slots error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch slots.' });
  }
};

// ============================================================
// 3. UPDATE SLOT
// PUT /api/time-slots/:timeSlotId
// ============================================================
const updateTimeSlot = async (req, res) => {
  const { timeSlotId } = req.params;
  const { timeSlotStartTime, timeSlotEndTime, timeSlotMaxCapacity, timeSlotIsActive } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "timeSlot" SET
       "timeSlotStartTime" = COALESCE($1, "timeSlotStartTime"),
       "timeSlotEndTime" = COALESCE($2, "timeSlotEndTime"),
       "timeSlotMaxCapacity" = COALESCE($3, "timeSlotMaxCapacity"),
       "timeSlotIsActive" = COALESCE($4, "timeSlotIsActive")
       WHERE "timeSlotId" = $5
       RETURNING *`,
      [timeSlotStartTime, timeSlotEndTime, timeSlotMaxCapacity, timeSlotIsActive, timeSlotId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Slot not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update slot error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slot.' });
  }
};

// ============================================================
// 4. DELETE SLOT
// DELETE /api/time-slots/:timeSlotId
// ============================================================
const deleteTimeSlot = async (req, res) => {
  const { timeSlotId } = req.params;

  try {
    // Soft delete
    const result = await pool.query(
        'UPDATE "timeSlot" SET "timeSlotIsActive" = false WHERE "timeSlotId" = $1 RETURNING *',
        [timeSlotId]
    );

    if (result.rows.length === 0) {
       return res.status(404).json({ success: false, error: 'Slot not found.' });
    }
    
    return res.status(200).json({ success: true, message: 'Slot deleted (deactivated) successfully.' });
  } catch (error) {
    console.error('Delete slot error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete slot.' });
  }
};

module.exports = { addTimeSlot, viewAllTimeSlot, updateTimeSlot, deleteTimeSlot };
