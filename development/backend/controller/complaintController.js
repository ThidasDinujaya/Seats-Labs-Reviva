const pool = require('../config/database');

const addComplaint = async (req, res) => {
  const { complaintTitle, complaintDescription, complaintPriority, customerId, bookingId } = req.body;

  try {
    if (!complaintTitle || !complaintDescription || !customerId) {
        return res.status(400).json({ success: false, error: 'Title, description and customerId are required.' });
    }

    if (bookingId) {
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
                error: 'Complaints for specific bookings can only be made after completion.'
            });
        }
    }

    const result = await pool.query(
      `INSERT INTO "complaint"
       ("complaintTitle", "complaintDescription", "complaintPriority", "complaintStatus", "customerId", "bookingId")
       VALUES ($1, $2, $3, 'open', $4, $5)
       RETURNING *`,
      [complaintTitle, complaintDescription, complaintPriority || 'medium', customerId, bookingId || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add complaint error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add complaint.' });
  }
};

const viewAllComplaint = async (req, res) => {
  const { customerId } = req.query;
  try {
    let query = `
      SELECT comp."complaintId", comp."complaintTitle", comp."complaintDescription", comp."complaintPriority", comp."complaintStatus", comp."complaintManagerResponse", comp."customerId", comp."bookingId", comp."complaintCreatedAt", comp."complaintResolvedAt",
             c."customerFirstName", c."customerLastName", b."bookingRefNumber"
      FROM "complaint" comp
      JOIN "customer" c ON comp."customerId" = c."customerId"
      LEFT JOIN "booking" b ON comp."bookingId" = b."bookingId"
      WHERE 1=1
    `;
    const params = [];
    if (customerId) {
        query += ` AND comp."customerId" = $1`;
        params.push(customerId);
    }
    query += ' ORDER BY comp."complaintCreatedAt" DESC';

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get all complaints error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints.' });
  }
};

const updateComplaint = async (req, res) => {
    const { id } = req.params;
    const { complaintStatus, complaintManagerResponse } = req.body;

    try {
        const resolvedAt = complaintStatus === 'resolved' ? 'CURRENT_TIMESTAMP' : 'NULL';
        const result = await pool.query(
            `UPDATE "complaint" SET
             "complaintStatus" = COALESCE($1, "complaintStatus"),
             "complaintManagerResponse" = COALESCE($2, "complaintManagerResponse"),
             "complaintResolvedAt" = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE "complaintResolvedAt" END
             WHERE "complaintId" = $3 RETURNING *`,
            [complaintStatus, complaintManagerResponse, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Complaint not found.' });
        }

        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Update complaint error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update complaint.' });
    }
};

module.exports = { addComplaint, viewAllComplaint, updateComplaint };
