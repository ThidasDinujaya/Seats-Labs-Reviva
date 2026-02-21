// ============================================================
// controller/paymentController.js
// PURPOSE: Handle payment and invoice operations.
// ============================================================

const pool = require('../config/database');

// Create a payment for an invoice
const createPayment = async (req, res) => {
  const { 
    invoiceId, 
    paymentAmount, 
    paymentMethod, 
    paymentReference,
    paymentSlipUrl,
    paymentCardBrand,
    paymentCardLastFour
  } = req.body;

  try {
    if (!invoiceId || !paymentAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId, paymentAmount, and paymentMethod are required.'
      });
    }

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ success: false, error: 'paymentAmount must be a valid number greater than zero.' });
    }

    const invoiceCheck = await pool.query(
        `SELECT "invoiceStatus", "invoiceAmount", "bookingId", "advertisementId" FROM "invoice" WHERE "invoiceId" = $1`,
        [invoiceId]
    );

    if (invoiceCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    const invoice = invoiceCheck.rows[0];

    if (invoice.invoiceStatus === 'paid') {
        return res.status(400).json({ success: false, error: 'Invoice is already paid.' });
    }

    // Optional: Check if payment amount matches invoice amount
    // if (parseFloat(invoice.invoiceAmount) !== amountNum) { ... }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert payment
      const paymentResult = await client.query(
        `INSERT INTO "payment" ("paymentAmount", "paymentMethod", "paymentStatus", "invoiceId", "paymentReference", "paymentSlipUrl", "paymentCardBrand", "paymentCardLastFour")
         VALUES ($1, $2, 'completed', $3, $4, $5, $6, $7)
         RETURNING *`,
        [amountNum, paymentMethod, invoiceId, paymentReference || null, paymentSlipUrl || null, paymentCardBrand || null, paymentCardLastFour || null]
      );

      // 2. Update invoice status
      await client.query(
        `UPDATE "invoice" SET "invoiceStatus" = 'paid' WHERE "invoiceId" = $1`,
        [invoiceId]
      );

      // 3. Handle specific logic based on what the invoice is for
      if (invoice.bookingId) {
          // If it's a booking, we might want to update its status or at least log the payment
          // Note: In this system, we keep it as 'pending' or move to 'accepted' if desired.
          // For now, let's just ensure it's at least 'accepted' if it was 'pending'
          await client.query(
              `UPDATE "booking" SET "bookingStatus" = 'accepted' WHERE "bookingId" = $1 AND "bookingStatus" = 'pending'`,
              [invoice.bookingId]
          );
          
          // Also add a tracking record for the payment
          await client.query(
              `INSERT INTO "serviceTracking" ("serviceTrackingStatus", "bookingId") VALUES ($1, $2)`,
              ['payment_received', invoice.bookingId]
          );
      } else if (invoice.advertisementId) {
          // If it's an ad, we activate it
          await client.query(
              `UPDATE "advertisement" SET "advertisementStatus" = 'active' WHERE "advertisementId" = $1 AND "advertisementStatus" = 'pending'`,
              [invoice.advertisementId]
          );
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        data: paymentResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Payment Transaction Error:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment.'
    });
  }
};

// Get invoice by booking ID
const getInvoiceByBookingId = async (req, res) => {
  const { bookingId } = req.params;
  const { userRole, customerId } = req.user;

  try {
    if (!bookingId || isNaN(bookingId)) {
        return res.status(400).json({ success: false, error: 'Valid bookingId is required.' });
    }

    // Fetch invoice and booking ownership info
    // We join with user to get the email since it's not in the customer table
    const result = await pool.query(
      `SELECT i."invoiceId", i."invoiceNumber", i."invoiceAmount", i."invoiceStatus", i."bookingId", i."advertisementId", i."invoiceCreatedAt", b."bookingRefNumber", b."customerId" as "ownerCustomerId",
              c."customerFirstName", c."customerLastName", u."userEmail" as "customerEmail", c."customerPhone", c."customerAddress",
              v."vehicleMake", v."vehicleModel", v."vehicleRegNumber",
              COALESCE(s."serviceName", p."servicePackageName") as "serviceName",
              COALESCE(s."servicePrice", p."servicePackagePrice") as "servicePrice"
       FROM "invoice" i
       JOIN "booking" b ON i."bookingId" = b."bookingId"
       JOIN "customer" c ON b."customerId" = c."customerId"
       JOIN "user" u ON c."userId" = u."userId"
       JOIN "vehicle" v ON b."vehicleId" = v."vehicleId"
       LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "servicePackage" p ON b."servicePackageId" = p."servicePackageId"
       WHERE i."bookingId" = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found for this booking.' });
    }

    const invoice = result.rows[0];

    // Ownership check: Manager can see all, Customer can only see their own
    if (userRole !== 'manager' && (customerId === undefined || invoice.ownerCustomerId !== customerId)) {
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this invoice.' });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch invoice details: ' + error.message });
  }
};

// Get invoice by advertisement ID
const getInvoiceByAdId = async (req, res) => {
  const { advertisementId } = req.params;
  const { userRole, advertiserId } = req.user;

  try {
    if (!advertisementId || isNaN(advertisementId)) {
        return res.status(400).json({ success: false, error: 'Valid advertisementId is required.' });
    }

    const result = await pool.query(
      `SELECT i.*, a."advertisementTitle", a."advertiserId" as "ownerAdvertiserId",
              adv."advertiserBusinessName", u."userEmail" as "advertiserEmail", adv."advertiserPhone", adv."advertiserAddress"
       FROM "invoice" i
       JOIN "advertisement" a ON i."advertisementId" = a."advertisementId"
       JOIN "advertiser" adv ON a."advertiserId" = adv."advertiserId"
       JOIN "user" u ON adv."userId" = u."userId"
       WHERE i."advertisementId" = $1`,
      [advertisementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found for this advertisement.' });
    }

    const invoice = result.rows[0];

    // Ownership check: Manager or the Advertiser
    if (userRole !== 'manager' && (advertiserId === undefined || advertiserId !== invoice.ownerAdvertiserId)) {
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this invoice.' });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get ad invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch invoice details: ' + error.message });
  }
};

// Get all payment for manager
const getAllPayment = async (req, res) => {
  const { userRole } = req.user;

  if (userRole !== 'manager') {
    return res.status(403).json({ success: false, error: 'Access denied. Manager only.' });
  }

  try {
    const result = await pool.query(
      `SELECT p."paymentId", p."paymentAmount", p."paymentMethod", p."paymentStatus", p."paymentDate", p."paymentReference", p."paymentSlipUrl", p."paymentCardBrand", p."paymentCardLastFour", p."invoiceId", p."paymentCreatedAt",
              i."invoiceNumber", i."bookingId", i."advertisementId",
              c."customerFirstName", c."customerLastName",
              adv."advertiserBusinessName",
              s."serviceName",
              apl."advertisementPlacementName"
       FROM "payment" p
       JOIN "invoice" i ON p."invoiceId" = i."invoiceId"
       LEFT JOIN "booking" b ON i."bookingId" = b."bookingId"
       LEFT JOIN "customer" c ON b."customerId" = c."customerId"
       LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "advertisement" a ON i."advertisementId" = a."advertisementId"
       LEFT JOIN "advertiser" adv ON a."advertiserId" = adv."advertiserId"
       LEFT JOIN "advertisementPlacement" apl ON a."advertisementPlacementId" = apl."advertisementPlacementId"
       ORDER BY p."paymentCreatedAt" DESC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all payment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment.' });
  }
};

const getAdvertiserPayment = async (req, res) => {
  const { advertiserId } = req.user;

  if (!advertiserId) {
    return res.status(403).json({ success: false, error: 'Access denied. Advertiser only.' });
  }

  try {
    const result = await pool.query(
      `SELECT p.*, i."invoiceNumber", i."advertisementId",
              apl."advertisementPlacementName",
              a."advertisementTitle"
       FROM "payment" p
       JOIN "invoice" i ON p."invoiceId" = i."invoiceId"
       JOIN "advertisement" a ON i."advertisementId" = a."advertisementId"
       LEFT JOIN "advertisementPlacement" apl ON a."advertisementPlacementId" = apl."advertisementPlacementId"
       WHERE a."advertiserId" = $1
       ORDER BY p."paymentCreatedAt" DESC`,
      [advertiserId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get advertiser payment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment.' });
  }
};

module.exports = { createPayment, getInvoiceByBookingId, getInvoiceByAdId, getAllPayment, getAdvertiserPayment };
