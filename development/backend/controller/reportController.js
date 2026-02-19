// ============================================================
// controllers/reportController.js
// PURPOSE: Generate the 4 essential business reports.
// REPORTS:
//   1. Daily Booking Report    - All bookings for a specific day
//   2. Revenue Analysis Report - Service + ad revenue breakdown
//   3. Technician Performance  - Work done by each technician
//   4. Customer Satisfaction   - Ratings and feedback analysis
// ============================================================
// THINKING: These 4 reports are critical for Auto M's business
// decisions and growth planning. Each report queries specific
// data, aggregates it, and returns structured results.
// ============================================================

const pool = require("../config/database");

// ============================================================
// REPORT 1: Daily Booking Report
// GET /api/reports/dailyBooking?date=2025-03-15
// ============================================================
// PURPOSE: Shows all bookings for a specific day with status
// breakdown. Helps admin plan daily operations and track capacity.
// ============================================================
const generateDailyBookingReport = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res
      .status(400)
      .json({ success: false, error: "date query parameter is required." });
  }

  try {
    // Get all bookings for the specified date
    const bookingsResult = await pool.query(
      `SELECT b.*,
        c."customerFirstName", c."customerLastName", c."customerPhone",
        v."vehicleMake", v."vehicleModel", v."vehicleRegNumber",
        s."serviceName", s."servicePrice", s."serviceDuration",
        t."technicianFirstName", t."technicianLastName"
       FROM "booking" b
       JOIN "customer" c ON b."customerId" = c."customerId"
       JOIN "vehicle" v ON b."vehicleId" = v."vehicleId"
       JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "technician" t ON b."technicianId" = t."technicianId"
       WHERE b."bookingDate" = $1
       ORDER BY b."bookingStartTime" ASC`,
      [date],
    );

    // Get status breakdown counts
    const statusResult = await pool.query(
      `SELECT "bookingStatus", COUNT(*) as count
       FROM "booking"
       WHERE "bookingDate" = $1
       GROUP BY "bookingStatus"`,
      [date],
    );

    // Calculate total revenue for the day
    const revenueResult = await pool.query(
      `SELECT SUM(s."servicePrice") as "totalRevenue"
       FROM "booking" b
       JOIN "service" s ON b."serviceId" = s."serviceId"
       WHERE b."bookingDate" = $1 AND b."bookingStatus" = 'completed'`,
      [date],
    );

    // Build the report object
    const reportData = {
      reportDate: date,
      totalBookings: bookingsResult.rows.length,
      statusBreakdown: statusResult.rows,
      totalRevenue: revenueResult.rows[0].totalRevenue || 0,
      bookings: bookingsResult.rows,
    };

    // Save report to database
    await pool.query(
      `INSERT INTO "report" ("reportType", "reportStartDate", "reportEndDate", "reportData", "userId")
       VALUES ('dailyBooking', $1, $1, $2, $3)`,
      [date, JSON.stringify(reportData), parseInt(req.user.userId)],
    );

    return res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error("Daily booking report error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate daily report: " + error.message });
  }
};

// ============================================================
// REPORT 2: Revenue Analysis Report
// GET /api/reports/revenueAnalysis?startDate=2025-03-01&endDate=2025-03-31
// ============================================================
// PURPOSE: Shows service revenue + advertisement revenue for a
// date range. Helps admin understand income sources and trends.
// ============================================================
const generateRevenueReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ success: false, error: "startDate and endDate are required." });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, error: "startDate cannot be after endDate." });
  }

  try {
    // Service revenue by service type
    const serviceRevenueResult = await pool.query(
      `SELECT s."serviceName", 
        COUNT(b."bookingId") as "bookingCount",
        SUM(s."servicePrice") as "totalRevenue"
       FROM "booking" b
       JOIN "service" s ON b."serviceId" = s."serviceId"
       WHERE b."bookingDate" BETWEEN $1 AND $2
       AND b."bookingStatus" = 'completed'
       GROUP BY s."serviceName"
       ORDER BY "totalRevenue" DESC`,
      [startDate, endDate],
    );

    // Daily revenue trend
    const dailyRevenueResult = await pool.query(
      `SELECT b."bookingDate",
        COUNT(b."bookingId") as "bookingCount",
        SUM(s."servicePrice") as "dailyRevenue"
       FROM "booking" b
       JOIN "service" s ON b."serviceId" = s."serviceId"
       WHERE b."bookingDate" BETWEEN $1 AND $2
       AND b."bookingStatus" = 'completed'
       GROUP BY b."bookingDate"
       ORDER BY b."bookingDate" ASC`,
      [startDate, endDate],
    );

    // Advertisement revenue
    const adRevenueResult = await pool.query(
      `SELECT SUM(p."paymentAmount") as "totalAdRevenue"
       FROM "payment" p
       JOIN "invoice" i ON p."invoiceId" = i."invoiceId"
       WHERE p."paymentDate" BETWEEN $1 AND $2
       AND p."paymentStatus" = 'completed'`,
      [startDate, endDate],
    );

    // Refunds in period
    const refundResult = await pool.query(
      `SELECT SUM("refundAmount") as "totalRefunds"
       FROM "refund"
       WHERE "refundDate" BETWEEN $1 AND $2
       AND "refundStatus" = 'completed'`,
      [startDate, endDate],
    );

    // Total calculations
    const totalServiceRevenue = serviceRevenueResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.totalRevenue || 0),
      0,
    );
    const totalAdRevenue = parseFloat(
      (adRevenueResult.rows[0] && adRevenueResult.rows[0].totalAdRevenue) || 0,
    );
    const totalRefunds = parseFloat(
      (refundResult.rows[0] && refundResult.rows[0].totalRefunds) || 0,
    );

    const safeTotalServiceRevenue = isNaN(totalServiceRevenue) ? 0 : totalServiceRevenue;
    const safeTotalAdRevenue = isNaN(totalAdRevenue) ? 0 : totalAdRevenue;
    const safeTotalRefunds = isNaN(totalRefunds) ? 0 : totalRefunds;

    const reportData = {
      reportPeriod: { startDate, endDate },
      serviceRevenue: {
        total: safeTotalServiceRevenue,
        byService: serviceRevenueResult.rows,
      },
      advertisementRevenue: {
        total: safeTotalAdRevenue,
      },
      refunds: {
        total: safeTotalRefunds,
      },
      combinedRevenue: safeTotalServiceRevenue + safeTotalAdRevenue - safeTotalRefunds,
      dailyTrend: dailyRevenueResult.rows,
    };

    await pool.query(
      `INSERT INTO "report" ("reportType", "reportStartDate", "reportEndDate", "reportData", "userId")
       VALUES ('revenueAnalysis', $1, $2, $3, $4)`,
      [startDate, endDate, JSON.stringify(reportData), parseInt(req.user.userId)],
    );

    return res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error("Revenue report error detail:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate revenue report: " + error.message });
  }
};

// ============================================================
// REPORT 3: Technician Performance Report
// GET /api/reports/technicianPerformance?startDate=2025-03-01&endDate=2025-03-31
// ============================================================
// PURPOSE: Shows each technician's workload, completion rate,
// and average rating. Helps optimize technician allocation.
// ============================================================
const generateTechnicianPerformanceReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ success: false, error: "startDate and endDate are required." });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, error: "startDate cannot be after endDate." });
  }

  try {
    const result = await pool.query(
      `SELECT 
        t."technicianId",
        t."technicianFirstName",
        t."technicianLastName",
        t."technicianSpecialization",
        COUNT(b."bookingId") as "totalJobs",
        COUNT(CASE WHEN b."bookingStatus" = 'completed' THEN 1 END) as "completedJobs",
        ROUND(AVG(f."feedbackRating"), 1) as "averageRating",
        COUNT(f."feedbackId") as "totalRatings",
        SUM(s."servicePrice") as "revenueGenerated"
       FROM "technician" t
       LEFT JOIN "booking" b ON t."technicianId" = b."technicianId"
         AND b."bookingDate" BETWEEN $1 AND $2
       LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "feedback" f ON b."bookingId" = f."bookingId"
       GROUP BY t."technicianId", t."technicianFirstName", t."technicianLastName", t."technicianSpecialization"
       ORDER BY "completedJobs" DESC`,
      [startDate, endDate],
    );

    const reportData = {
      reportPeriod: { startDate, endDate },
      technicians: result.rows,
      summary: {
        totalTechnicians: result.rows.length,
        totalJobsCompleted: result.rows.reduce(
          (sum, r) => sum + parseInt(r.completedJobs || 0),
          0,
        ),
        overallAverageRating:
          result.rows.length > 0
            ? (
                result.rows.reduce(
                  (sum, r) => sum + parseFloat(r.averageRating || 0),
                  0,
                ) / result.rows.filter((r) => r.averageRating).length
              ).toFixed(1)
            : 0,
      },
    };

    await pool.query(
      `INSERT INTO "report" ("reportType", "reportStartDate", "reportEndDate", "reportData", "userId")
       VALUES ('technicianPerformance', $1, $2, $3, $4)`,
      [startDate, endDate, JSON.stringify(reportData), parseInt(req.user.userId)],
    );

    return res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error("Technician performance report error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate technician report: " + error.message });
  }
};

// ============================================================
// REPORT 4: Ad Performance Report
// GET /api/reports/adPerformance?startDate=2025-03-01&endDate=2025-03-31
// ============================================================
// PURPOSE: Analyzes advertisement performance (impressions, clicks, CTR).
// ============================================================
const generateAdPerformanceReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ success: false, error: "startDate and endDate are required." });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, error: "startDate cannot be after endDate." });
  }

  try {
    // Total Impressions in period
    const impressionsResult = await pool.query(
      `SELECT COUNT(*) as "totalImpressions" 
       FROM "advertisementImpression" 
       WHERE "advertisementImpressionCreatedAt" BETWEEN $1 AND $2`,
      [startDate, endDate],
    );

    // Total Clicks in period
    const clicksResult = await pool.query(
      `SELECT COUNT(*) as "totalClicks" 
       FROM "advertisementClick" 
       WHERE "advertisementClickCreatedAt" BETWEEN $1 AND $2`,
      [startDate, endDate],
    );

    // Ads Active in period (overlap check)
    const activeAdsResult = await pool.query(
      `SELECT COUNT(*) as "activeAds" 
       FROM "advertisement" 
       WHERE "advertisementStartDate" <= $2 AND "advertisementEndDate" >= $1`,
      [startDate, endDate],
    );

    const totalImpressions = parseInt(
      impressionsResult.rows[0].totalImpressions || 0,
    );
    const totalClicks = parseInt(clicksResult.rows[0].totalClicks || 0);
    const activeAds = parseInt(activeAdsResult.rows[0].activeAds || 0);
    const ctr =
      totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(2)
        : 0;

    // Performance by Placement
    const placementPerformanceResult = await pool.query(
      `SELECT 
         ap."advertisementPlacementId",
         ap."advertisementPlacementName",
         ap."advertisementPlacementSlug",
         COUNT(DISTINCT ai."advertisementImpressionId") as "advertisementImpressions",
         COUNT(DISTINCT ac."advertisementClickId") as "advertisementClicks"
       FROM "advertisementPlacement" ap
       LEFT JOIN "advertisement" a ON ap."advertisementPlacementId" = a."advertisementPlacementId"
       LEFT JOIN "advertisementImpression" ai ON a."advertisementId" = ai."advertisementId" 
         AND ai."advertisementImpressionCreatedAt" BETWEEN $1 AND $2
       LEFT JOIN "advertisementClick" ac ON a."advertisementId" = ac."advertisementId" 
         AND ac."advertisementClickCreatedAt" BETWEEN $1 AND $2
       GROUP BY ap."advertisementPlacementId", ap."advertisementPlacementName", ap."advertisementPlacementSlug"
       ORDER BY "advertisementImpressions" DESC`,
      [startDate, endDate],
    );

    // Top Performing Ads
    const topAdsResult = await pool.query(
      `SELECT 
         a."advertisementId",
         a."advertisementTitle",
         a."advertisementImageUrl",
         COUNT(DISTINCT ai."advertisementImpressionId") as "advertisementImpressions",
         COUNT(DISTINCT ac."advertisementClickId") as "advertisementClicks"
       FROM "advertisement" a
       LEFT JOIN "advertisementImpression" ai ON a."advertisementId" = ai."advertisementId" 
         AND ai."advertisementImpressionCreatedAt" BETWEEN $1 AND $2
       LEFT JOIN "advertisementClick" ac ON a."advertisementId" = ac."advertisementId" 
         AND ac."advertisementClickCreatedAt" BETWEEN $1 AND $2
       WHERE a."advertisementStartDate" <= $2 AND a."advertisementEndDate" >= $1
       GROUP BY a."advertisementId", a."advertisementTitle", a."advertisementImageUrl"
       ORDER BY "advertisementClicks" DESC
       LIMIT 5`,
      [startDate, endDate],
    );

    const reportData = {
      reportPeriod: { startDate, endDate },
      summary: {
        totalImpressions,
        totalClicks,
        ctr: ctr + "%",
        activeAds,
      },
      byPlacement: placementPerformanceResult.rows.map((row) => ({
        ...row,
        ctr:
          row.advertisementImpressions > 0
            ? ((row.advertisementClicks / row.advertisementImpressions) * 100).toFixed(2) + "%"
            : "0%",
      })),
      topAds: topAdsResult.rows.map((row) => ({
        ...row,
        ctr:
          row.advertisementImpressions > 0
            ? ((row.advertisementClicks / row.advertisementImpressions) * 100).toFixed(2) + "%"
            : "0%",
      })),
    };

    // Save report to database
    await pool.query(
      `INSERT INTO "report" ("reportType", "reportStartDate", "reportEndDate", "reportData", "userId")
       VALUES ('adPerformance', $1, $2, $3, $4)`,
      [startDate, endDate, JSON.stringify(reportData), parseInt(req.user.userId)],
    );

    return res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error("Ad performance report error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate ad report: " + error.message });
  }
};

// DB MIGRATION: Outdated initReportSchema removed as it is handled by the main schema file.

module.exports = {
  generateDailyBookingReport,
  generateRevenueReport,
  generateTechnicianPerformanceReport,
  generateAdPerformanceReport
};
