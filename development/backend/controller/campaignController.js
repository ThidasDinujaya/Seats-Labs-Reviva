// ============================================================
// controllers/campaignController.js
// PURPOSE: Advertisement campaign management operations
// ============================================================

const pool = require('../config/database');

// ============================================================
// 1. CREATE CAMPAIGN
// POST /api/campaign
// ============================================================
const createCampaign = async (req, res) => {
  const {
    advertisementCampaignName,
    advertisementCampaignStartDate,
    advertisementCampaignEndDate,
    advertiserId
  } = req.body;

  try {
    if (!advertisementCampaignName || !advertisementCampaignStartDate || !advertisementCampaignEndDate || !advertiserId) {
      return res.status(400).json({
        success: false,
        error: 'advertisementCampaignName, advertisementCampaignStartDate, advertisementCampaignEndDate, and advertiserId are required.'
      });
    }

    if (new Date(advertisementCampaignEndDate) <= new Date(advertisementCampaignStartDate)) {
      return res.status(400).json({
        success: false,
        error: 'advertisementCampaignEndDate must be after advertisementCampaignStartDate.'
      });
    }

    const result = await pool.query(
      `INSERT INTO "advertisementCampaign"
       ("advertisementCampaignName",
        "advertisementCampaignStartDate", "advertisementCampaignEndDate", "advertiserId")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [advertisementCampaignName,
       advertisementCampaignStartDate, advertisementCampaignEndDate, advertiserId]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create campaign.' });
  }
};

// ============================================================
// 2. GET ALL CAMPAIGN
// GET /api/campaign?status=active&advertiserId=1
// ============================================================
const getAllCampaign = async (req, res) => {
  const { status, advertiserId } = req.query;

  try {
    let query = `
      SELECT c.*, 
        adv."advertiserBusinessName",
        COUNT(DISTINCT a."advertisementId") as "totalAds",
        SUM(CASE WHEN a."advertisementStatus" = 'active' THEN 1 ELSE 0 END) as "activeAds"
      FROM "advertisementCampaign" c
      JOIN "advertiser" adv ON c."advertiserId" = adv."advertiserId"
      LEFT JOIN "advertisement" a ON a."advertisementCampaignId" = c."advertisementCampaignId"
      WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND c."advertisementCampaignStatus" = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (advertiserId) {
      query += ` AND c."advertiserId" = $${paramIndex}`;
      params.push(advertiserId);
      paramIndex++;
    }

    query += ' GROUP BY c."advertisementCampaignId", adv."advertiserBusinessName" ORDER BY c."advertisementCampaignCreatedAt" DESC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('Get all campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch campaign.' });
  }
};

// ============================================================
// 3. GET CAMPAIGN BY ID (with ad)
// GET /api/campaign/:campaignId
// ============================================================
const getCampaign = async (req, res) => {
  const { advertisementCampaignId } = req.params;

  try {
    const campaignResult = await pool.query(
      `SELECT c.*, adv."advertiserBusinessName"
       FROM "advertisementCampaign" c
       JOIN "advertiser" adv ON c."advertiserId" = adv."advertiserId"
       WHERE c."advertisementCampaignId" = $1`,
      [advertisementCampaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    const adsResult = await pool.query(
      `SELECT a.*, ap."advertisementPlacementName", i."invoiceStatus",
        (SELECT COUNT(*) FROM "advertisementImpression" WHERE "advertisementId" = a."advertisementId") as "totalImpressions",
        (SELECT COUNT(*) FROM "advertisementClick" WHERE "advertisementId" = a."advertisementId") as "totalClicks"
       FROM "advertisement" a
       LEFT JOIN "advertisementPlacement" ap ON a."advertisementPlacementId" = ap."advertisementPlacementId"
       LEFT JOIN "invoice" i ON a."advertisementId" = i."advertisementId"
       WHERE a."advertisementCampaignId" = $1
       ORDER BY a."advertisementCreatedAt" DESC`,
      [advertisementCampaignId]
    );

    return res.status(200).json({
      success: true,
      data: {
        campaign: campaignResult.rows[0],
        ads: adsResult.rows
      }
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch campaign.' });
  }
};

// ============================================================
// 4. UPDATE CAMPAIGN
// PUT /api/campaign/:campaignId
// ============================================================
const updateCampaign = async (req, res) => {
  const { advertisementCampaignId } = req.params;
  const {
    advertisementCampaignName,
    advertisementCampaignStartDate,
    advertisementCampaignEndDate,
    advertisementCampaignStatus
  } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM "advertisementCampaign" WHERE "advertisementCampaignId" = $1',
      [advertisementCampaignId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    const result = await pool.query(
      `UPDATE "advertisementCampaign" SET
        "advertisementCampaignName" = COALESCE($1, "advertisementCampaignName"),
        "advertisementCampaignStartDate" = COALESCE($2, "advertisementCampaignStartDate"),
        "advertisementCampaignEndDate" = COALESCE($3, "advertisementCampaignEndDate"),
        "advertisementCampaignStatus" = COALESCE($4, "advertisementCampaignStatus")
       WHERE "advertisementCampaignId" = $5
       RETURNING *`,
      [advertisementCampaignName,
       advertisementCampaignStartDate, advertisementCampaignEndDate, advertisementCampaignStatus, advertisementCampaignId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update campaign.' });
  }
};

// ============================================================
// 5. DELETE CAMPAIGN
// DELETE /api/campaign/:campaignId
// ============================================================
const deleteCampaign = async (req, res) => {
  const { advertisementCampaignId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM "advertisementCampaign" WHERE "advertisementCampaignId" = $1',
      [advertisementCampaignId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    // Cascade will handle related ads (set their advertisementCampaignId to NULL)
    await pool.query('DELETE FROM "advertisementCampaign" WHERE "advertisementCampaignId" = $1', [advertisementCampaignId]);

    return res.status(200).json({
      success: true,
      data: { message: 'Campaign deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete campaign.' });
  }
};

// ============================================================
// 6. ADD AD TO CAMPAIGN
// POST /api/campaign/:campaignId/advertisement
// ============================================================
const addAdToCampaign = async (req, res) => {
  const { advertisementCampaignId } = req.params;
  const {
    advertisementTitle,
    advertisementImageUrl,
    advertisementStartDate,
    advertisementEndDate,
    advertisementPlacementId
  } = req.body;

  try {
    // Verify campaign exists
    const campaignCheck = await pool.query(
      'SELECT * FROM "advertisementCampaign" WHERE "advertisementCampaignId" = $1',
      [advertisementCampaignId]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    const campaign = campaignCheck.rows[0];

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
         campaign.advertiserId, advertisementPlacementId, advertisementCampaignId]
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
      const invoiceNumber = `INV-AD-CPN-${newAd.advertisementId}-${Date.now().toString().slice(-4)}`;
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
    console.error('Add ad to campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add ad to campaign.' });
  }
};

module.exports = {
  createCampaign,
  getAllCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  addAdToCampaign
};
