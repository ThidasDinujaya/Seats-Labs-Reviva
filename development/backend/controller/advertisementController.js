// ============================================================
// controllers/advertisementController.js
// PURPOSE: CRUD #5 - Advertisement management operations.
// CRUD OPERATIONS:
//   1. addAdvertisement      - POST   /api/advertisements
//   2. viewAdvertisement     - GET    /api/advertisements/:advertisementId
//   3. viewAllAdvertisements - GET    /api/advertisements
//   4. updateAdvertisement   - PUT    /api/advertisements/:advertisementId
//   5. deleteAdvertisement   - DELETE /api/advertisements/:advertisementId
// ============================================================

const pool = require('../config/database');

// ============================================================
// 1. ADD ADVERTISEMENT
// POST /api/advertisements
// WHO CAN USE: Advertiser, Admin
// ============================================================
// THINKING: When an advertiser creates an ad, it starts with
// status "pending" and needs admin approval before it goes live.
// ============================================================
const addAdvertisement = async (req, res) => {
  const {
    advertisementTitle,
    advertisementImageUrl,
    advertisementStartDate,
    advertisementEndDate,
    advertiserId,
    advertisementPlacementId,
    advertisementCampaignId
  } = req.body;

  try {
    if (!advertisementTitle || !advertisementStartDate || !advertisementEndDate || !advertiserId) {
      return res.status(400).json({
        success: false,
        error: 'advertisementTitle, advertisementStartDate, advertisementEndDate, and advertiserId are required.'
      });
    }

    // Validate dates: end date must be after start date
    if (new Date(advertisementEndDate) <= new Date(advertisementStartDate)) {
      return res.status(400).json({
        success: false,
        error: 'advertisementEndDate must be after advertisementStartDate.'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const adResult = await client.query(
        `INSERT INTO "advertisement"
         ("advertisementTitle", "advertisementImageUrl",
          "advertisementStartDate", "advertisementEndDate", "advertisementStatus",
          "advertiserId", "advertisementPlacementId", "advertisementCampaignId")
         VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7)
         RETURNING *`,
        [advertisementTitle, advertisementImageUrl,
         advertisementStartDate, advertisementEndDate,
         advertiserId, advertisementPlacementId, advertisementCampaignId]
      );

      const newAd = adResult.rows[0];

      // Fetch placement price to calculate invoice amount
      let finalAmount = 0;
      if (advertisementPlacementId) {
        const placementRes = await client.query(
          'SELECT "advertisementPlacementPrice" FROM "advertisementPlacement" WHERE "advertisementPlacementId" = $1',
          [advertisementPlacementId]
        );
        if (placementRes.rows.length > 0) {
          const pricePerDay = parseFloat(placementRes.rows[0].advertisementPlacementPrice);
          const start = new Date(advertisementStartDate);
          const end = new Date(advertisementEndDate);
          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
          finalAmount = pricePerDay * diffDays;
        }
      }

      // Create Invoice
      const invoiceNumber = `INV-AD-${newAd.advertisementId}-${Date.now().toString().slice(-4)}`;
      await client.query(
        `INSERT INTO "invoice" ("invoiceNumber", "invoiceAmount", "invoiceStatus", "advertisementId")
         VALUES ($1, $2, 'pending', $3)`,
        [invoiceNumber, finalAmount, newAd.advertisementId]
      );

      await client.query('COMMIT');
      return res.status(201).json({ success: true, data: newAd });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Add advertisement error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add advertisement.' });
  }
};

// ============================================================
// 2. VIEW ADVERTISEMENT
// GET /api/advertisements/:advertisementId
// ============================================================
const viewAdvertisement = async (req, res) => {
  const { advertisementId } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.*, adv."advertiserBusinessName",
        ap."advertisementPlacementName",
        ap."advertisementPlacementSlug",
        i."invoiceStatus",
        (SELECT COUNT(*) FROM "advertisementImpression" WHERE "advertisementId" = a."advertisementId") as "totalImpressions",
        (SELECT COUNT(*) FROM "advertisementClick" WHERE "advertisementId" = a."advertisementId") as "totalClicks"
       FROM "advertisement" a
       JOIN "advertiser" adv ON a."advertiserId" = adv."advertiserId"
       LEFT JOIN "advertisementPlacement" ap ON a."advertisementPlacementId" = ap."advertisementPlacementId"
       LEFT JOIN "invoice" i ON a."advertisementId" = i."advertisementId"
       WHERE a."advertisementId" = $1`,
      [advertisementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Advertisement not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('View advertisement error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch advertisement.' });
  }
};

// ============================================================
// 3. VIEW ALL ADVERTISEMENTS
// GET /api/advertisements?status=active&advertiserId=1
// ============================================================
const viewAllAdvertisements = async (req, res) => {
  const { status, advertiserId } = req.query;

  try {
    let query = `
      SELECT a.*, adv."advertiserBusinessName",
        ap."advertisementPlacementName",
        ap."advertisementPlacementSlug",
        i."invoiceStatus"
      FROM "advertisement" a
      JOIN "advertiser" adv ON a."advertiserId" = adv."advertiserId"
      LEFT JOIN "advertisementPlacement" ap ON a."advertisementPlacementId" = ap."advertisementPlacementId"
      LEFT JOIN "invoice" i ON a."advertisementId" = i."advertisementId"
      WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND a."advertisementStatus" = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (advertiserId) {
      query += ` AND a."advertiserId" = $${paramIndex}`;
      params.push(advertiserId);
      paramIndex++;
    }

    query += ' ORDER BY a."advertisementCreatedAt" DESC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all advertisements error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch advertisements.' });
  }
};

// ============================================================
// 4. UPDATE ADVERTISEMENT
// PUT /api/advertisements/:advertisementId
// ============================================================
const updateAdvertisement = async (req, res) => {
  const { advertisementId } = req.params;
  const {
    advertisementTitle, advertisementImageUrl,
    advertisementStartDate, advertisementEndDate, advertisementStatus,
    advertisementPlacementId, advertisementCampaignId
  } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM "advertisement" WHERE "advertisementId" = $1',
      [advertisementId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Advertisement not found.' });
    }

    const result = await pool.query(
      `UPDATE "advertisement" SET
        "advertisementTitle" = COALESCE($1, "advertisementTitle"),
        "advertisementImageUrl" = COALESCE($2, "advertisementImageUrl"),
        "advertisementStartDate" = COALESCE($3, "advertisementStartDate"),
        "advertisementEndDate" = COALESCE($4, "advertisementEndDate"),
        "advertisementStatus" = COALESCE($5, "advertisementStatus"),
        "advertisementPlacementId" = COALESCE($6, "advertisementPlacementId"),
        "advertisementCampaignId" = COALESCE($7, "advertisementCampaignId")
       WHERE "advertisementId" = $8
       RETURNING *`,
      [advertisementTitle, advertisementImageUrl,
       advertisementStartDate, advertisementEndDate, advertisementStatus,
       advertisementPlacementId, advertisementCampaignId, advertisementId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update advertisement error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update advertisement.' });
  }
};

// ============================================================
// 5. DELETE ADVERTISEMENT
// DELETE /api/advertisements/:advertisementId
// ============================================================
const deleteAdvertisement = async (req, res) => {
  const { advertisementId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM "advertisement" WHERE "advertisementId" = $1',
      [advertisementId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Advertisement not found.' });
    }

    // Delete related impressions and clicks first (cascading)
    await pool.query('DELETE FROM "advertisementImpression" WHERE "advertisementId" = $1', [advertisementId]);
    await pool.query('DELETE FROM "advertisementClick" WHERE "advertisementId" = $1', [advertisementId]);
    await pool.query('DELETE FROM "advertisement" WHERE "advertisementId" = $1', [advertisementId]);

    return res.status(200).json({
      success: true,
      data: { message: 'Advertisement deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete advertisement.' });
  }
};

// ============================================================
// 6. VIEW ADVERTISEMENT PLACEMENTS
// GET /api/advertisements/placements
// ============================================================
const viewAdvertisementPlacements = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "advertisementPlacement"');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('View ad placements error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch placements.' });
  }
};

module.exports = { addAdvertisement, viewAdvertisement, viewAllAdvertisements, updateAdvertisement, deleteAdvertisement, viewAdvertisementPlacements };