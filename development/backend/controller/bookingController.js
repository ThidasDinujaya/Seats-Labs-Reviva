// ============================================================
// controllers/bookingController.js
// PURPOSE: CRUD #2 - Booking management operations.
// CRUD OPERATIONS:
//   1. addBooking      - POST   /api/bookings
//   2. viewBooking     - GET    /api/bookings/:bookingId
//   3. viewAllBookings - GET    /api/bookings
//   4. updateBooking   - PUT    /api/bookings/:bookingId
//   5. deleteBooking   - DELETE /api/bookings/:bookingId
// ============================================================

const pool = require('../config/database');

// Helper: Generate a unique booking reference number
// THINKING: We combine a prefix "SL" with a timestamp and random number
// to create something like "SL-20250315-4829"
const generateRefNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SL-${dateStr}-${random}`;
};

// ============================================================
// 1. ADD BOOKING - Customer creates a new booking
// POST /api/bookings
// WHO CAN USE: Customer
// ============================================================
// THINKING: Creating a booking requires several steps:
// 1. Validate the input data
// 2. Check if the selected time slot is available
// 3. Calculate end time based on service duration
// 4. Check daily capacity hasn't been exceeded
// 5. Create the booking record
// 6. Create initial tracking record (status: "booked")
// 7. Update the daily capacity counter
// ============================================================
const addBooking = async (req, res) => {
  const {
    bookingDate,         
    bookingCustomerNotes, 
    customerId,   
    vehicleId,    
    serviceId,
    servicePackageId,
    timeSlotId
  } = req.body;

  try {
    // Step 1: Validate required fields
    if (!bookingDate || !timeSlotId || !customerId || !vehicleId || (!serviceId && !servicePackageId)) {
      return res.status(400).json({
        success: false,
        error: 'bookingDate, timeSlotId, customerId, vehicleId, and either serviceId or servicePackageId are required.'
      });
    }

    // NEW Step: Get Time Slot Details
    const slotResult = await pool.query(
      'SELECT "timeSlotStartTime", "timeSlotMaxCapacity" FROM "timeSlot" WHERE "timeSlotId" = $1 AND "timeSlotIsActive" = true',
      [timeSlotId]
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive time slot selected.' });
    }

    const { timeSlotStartTime, timeSlotMaxCapacity } = slotResult.rows[0];
    // Use the slot's start time as the booking start time
    const bookingStartTime = timeSlotStartTime; 

    // Step 2: Get the service or package to calculate end time
    let serviceDuration = 0;
    if (serviceId) {
        const serviceResult = await pool.query(
          'SELECT "serviceDuration" FROM "service" WHERE "serviceId" = $1',
          [serviceId]
        );
        if (serviceResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Service not found.' });
        serviceDuration = serviceResult.rows[0].serviceDuration;
    } else {
        serviceDuration = 120; // Default 2 hours for packages
    }

    // Step 3: Calculate end time
    // THINKING: We parse the start time, add the service duration in minutes,
    // and format the result back to a time string.
    const [hours, minutes] = bookingStartTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + serviceDuration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const bookingEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Step 4: Check time slot capacity for this specific date
    // We count existing bookings for this specific slot on this date
    const capacityResult = await pool.query(
      `SELECT COUNT(*) as count FROM "booking"
       WHERE "bookingDate" = $1 
       AND "timeSlotId" = $2
       AND "bookingStatus" NOT IN ('rejected')`,
      [bookingDate, timeSlotId]
    );

    const currentCount = parseInt(capacityResult.rows[0].count);

    if (currentCount >= timeSlotMaxCapacity) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is fully booked for the selected date.'
      });
    }
    
    // Check conflicts? (Optional if using rigid slots, but conflicts check removed for simplicity in slot-based model)

    // Step 6: Generate unique reference number
    const bookingRefNumber = generateRefNumber();

    // Step 7: Insert the booking
    const bookingResult = await pool.query(
      `INSERT INTO "booking"
       ("bookingDate", "bookingStartTime", "bookingEndTime", "bookingStatus",
        "bookingCustomerNotes", "bookingRefNumber", "customerId",
        "vehicleId", "serviceId", "servicePackageId", "timeSlotId")
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [bookingDate, bookingStartTime, bookingEndTime, bookingCustomerNotes,
       bookingRefNumber, customerId, vehicleId, serviceId || null, servicePackageId || null, timeSlotId]
    );

    const newBooking = bookingResult.rows[0];

    // NEW STEP: Fetch Price for Invoice
    let finalAmount = 0;
    if (serviceId) {
        const sRes = await pool.query('SELECT "servicePrice" FROM "service" WHERE "serviceId" = $1', [serviceId]);
        finalAmount = sRes.rows[0].servicePrice;
    } else {
        const pRes = await pool.query('SELECT "servicePackagePrice" FROM "servicePackage" WHERE "servicePackageId" = $1', [servicePackageId]);
        finalAmount = pRes.rows[0].servicePackagePrice;
    }

    // NEW STEP: Create Invoice
    const invoiceNumber = `INV-${newBooking.bookingRefNumber}`;
    await pool.query(
        `INSERT INTO "invoice" ("invoiceNumber", "invoiceAmount", "invoiceStatus", "bookingId")
         VALUES ($1, $2, 'pending', $3)`,
        [invoiceNumber, finalAmount, newBooking.bookingId]
    );

    // Step 8: Create initial service tracking record
    await pool.query(
      `INSERT INTO "serviceTracking"
       ("serviceTrackingStatus", "bookingId")
       VALUES ('booked', $1)`,
      [newBooking.bookingId]
    );

    // Step 9: Log in booking history
    await pool.query(
      `INSERT INTO "bookingHistory"
       ("bookingHistoryAction", "bookingId", "userId")
       VALUES ('created', $1, $2)`,
      [newBooking.bookingId, req.user.userId]
    );

    return res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    console.error('Add booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking.'
    });
  }
};

// ============================================================
// 2. VIEW BOOKING - Get a single booking with full details
// GET /api/bookings/:bookingId
// ============================================================
const viewBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // JOIN multiple tables to get complete booking information
    const result = await pool.query(
      `SELECT b.*,
        c."customerFirstName", c."customerLastName", c."customerPhone",
        v."vehicleMake", v."vehicleModel", v."vehicleRegNumber",
        s."serviceName", s."serviceDuration", s."servicePrice",
        p."servicePackageName", p."servicePackagePrice",
        t."technicianFirstName", t."technicianLastName",
        r."refundStatus", r."refundAmount",
        i."invoiceStatus"
       FROM "booking" b
       JOIN "customer" c ON b."customerId" = c."customerId"
       JOIN "vehicle" v ON b."vehicleId" = v."vehicleId"
       LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
       LEFT JOIN "servicePackage" p ON b."servicePackageId" = p."servicePackageId"
       LEFT JOIN "technician" t ON b."technicianId" = t."technicianId"
       LEFT JOIN "invoice" i ON b."bookingId" = i."bookingId"
       LEFT JOIN "refund" r ON i."invoiceId" = r."invoiceId"
       WHERE b."bookingId" = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('View booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch booking.' });
  }
};

// ============================================================
// 3. VIEW ALL BOOKINGS - List bookings with optional filters
// GET /api/bookings?status=pending&date=2025-03-15&customerId=1
// ============================================================
// THINKING: We support query parameters for filtering:
// - status: Filter by booking status
// - date: Filter by booking date
// - customerId: Filter by customer (for customer's own bookings)
// - technicianId: Filter by technician (for technician's assigned jobs)
// ============================================================
const viewAllBookings = async (req, res) => {
  const { status, date, customerId, technicianId } = req.query;

  try {
    // Build dynamic query with filters
    let query = `
      SELECT b.*,
        c."customerFirstName", c."customerLastName",
        v."vehicleMake", v."vehicleModel", v."vehicleRegNumber",
        s."serviceName", s."servicePrice",
        p."servicePackageName", p."servicePackagePrice",
        t."technicianFirstName", t."technicianLastName",
        r."refundStatus", r."refundAmount",
        i."invoiceStatus"
      FROM "booking" b
      JOIN "customer" c ON b."customerId" = c."customerId"
      JOIN "vehicle" v ON b."vehicleId" = v."vehicleId"
      LEFT JOIN "service" s ON b."serviceId" = s."serviceId"
      LEFT JOIN "servicePackage" p ON b."servicePackageId" = p."servicePackageId"
      LEFT JOIN "technician" t ON b."technicianId" = t."technicianId"
      LEFT JOIN "invoice" i ON b."bookingId" = i."bookingId"
      LEFT JOIN "refund" r ON i."invoiceId" = r."invoiceId"
      WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    // Add filters dynamically
    if (status) {
      query += ` AND b."bookingStatus" = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (date) {
      query += ` AND b."bookingDate" = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }
    if (customerId) {
      query += ` AND b."customerId" = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }
    if (technicianId) {
      query += ` AND b."technicianId" = $${paramIndex}`;
      params.push(technicianId);
      paramIndex++;
    }

    query += ' ORDER BY b."bookingDate" DESC, b."bookingStartTime" ASC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all bookings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings.' });
  }
};

// ============================================================
// 4. UPDATE BOOKING - Modify booking (approve, reject, assign tech, etc.)
// PUT /api/bookings/:bookingId
// ============================================================
const updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  let { bookingStatus, technicianId, bookingDate, timeSlotId, bookingCustomerNotes, bookingTechnicianNotes, vehicleId } = req.body;

  // Sanitize empty strings to null for COALESCE to work properly
  if (bookingStatus === '') bookingStatus = null;
  if (technicianId === '') technicianId = null;
  if (bookingDate === '') bookingDate = null;
  if (timeSlotId === '') timeSlotId = null;
  if (vehicleId === '') vehicleId = null;

  try {
    // Check if user is trying to set status to cancelled via update
    if (bookingStatus === 'cancelled') {
        return res.status(400).json({
            success: false,
            error: 'Use the cancellation endpoint to cancel a booking.'
        });
    }

    const existingRes = await pool.query(
      'SELECT * FROM "booking" WHERE "bookingId" = $1',
      [bookingId]
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const existing = existingRes.rows[0];

    // Business Logic: Only pending bookings can be updated by customers
    if (existing.bookingStatus !== 'pending' && req.user.userRole === 'customer') {
        return res.status(400).json({ 
            success: false, 
            error: `Cannot update a booking that is ${existing.bookingStatus}.` 
        });
    }

    let startTime = existing.bookingStartTime;
    let endTime = existing.bookingEndTime;

    // If timeSlotId is changing, fetch new start time and recalculate end time
    if (timeSlotId && timeSlotId !== existing.timeSlotId) {
        const slotResult = await pool.query(
            'SELECT "timeSlotStartTime" FROM "timeSlot" WHERE "timeSlotId" = $1',
            [timeSlotId]
        );
        if (slotResult.rows.length > 0) {
            startTime = slotResult.rows[0].timeSlotStartTime;
            
            // Recalculate end time based on original duration
            const [sH, sM] = startTime.split(':').map(Number);
            const [eH, eM] = existing.bookingEndTime.split(':').map(Number);
            const [esH, esM] = existing.bookingStartTime.split(':').map(Number);
            
            const duration = (eH * 60 + eM) - (esH * 60 + esM);
            const newEndMinutes = (sH * 60 + sM) + duration;
            const newEndHours = Math.floor(newEndMinutes / 60);
            const newEndMins = newEndMinutes % 60;
            endTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMins).padStart(2, '0')}`;
        }
    }

    const result = await pool.query(
      `UPDATE "booking" SET
        "bookingStatus" = COALESCE($1, "bookingStatus"),
        "technicianId" = COALESCE($2, "technicianId"),
        "bookingDate" = COALESCE($3, "bookingDate"),
        "timeSlotId" = COALESCE($4, "timeSlotId"),
        "bookingCustomerNotes" = COALESCE($5, "bookingCustomerNotes"),
        "bookingTechnicianNotes" = COALESCE($6, "bookingTechnicianNotes"),
        "vehicleId" = COALESCE($7, "vehicleId"),
        "bookingStartTime" = $8,
        "bookingEndTime" = $9
       WHERE "bookingId" = $10
       RETURNING *`,
      [bookingStatus, technicianId, bookingDate, timeSlotId, bookingCustomerNotes, bookingTechnicianNotes, vehicleId, startTime, endTime, bookingId]
    );

    // Log the update action in booking history
    const action = bookingStatus ? `status_changed_to_${bookingStatus}` : 'updated';
    await pool.query(
      `INSERT INTO "bookingHistory"
       ("bookingHistoryAction", "bookingId", "userId")
       VALUES ($1, $2, $3)`,
      [action, bookingId, req.user.userId]
    );

    // If status changed, create a service tracking record
    if (bookingStatus && bookingStatus !== existing.bookingStatus) {
      await pool.query(
        `INSERT INTO "serviceTracking"
         ("serviceTrackingStatus", "bookingId")
         VALUES ($1, $2)`,
        [bookingStatus, bookingId]
      );

      // AUTOMATED REFUND LOGIC: If rejected by workshop
      if (bookingStatus === 'rejected') {
        // Find if there's a paid invoice for this booking
        const invoiceRes = await pool.query(
          `SELECT "invoiceId", "invoiceAmount" FROM "invoice" 
           WHERE "bookingId" = $1 AND "invoiceStatus" = 'paid'`,
          [bookingId]
        );

        if (invoiceRes.rows.length > 0) {
          const invoice = invoiceRes.rows[0];
          // Create refund record (100% for rejection)
          await pool.query(
            `INSERT INTO "refund" ("refundAmount", "refundReason", "refundStatus", "invoiceId")
             VALUES ($1, $2, 'pending', $3)`,
            [invoice.invoiceAmount, 'Booking rejected by workshop', invoice.invoiceId]
          );
          
          // Update invoice status to reflect partial/full refund state if needed
          // For simplicity, we keep invoice as paid but linked to a pending refund
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update booking.' });
  }
};

// 5. CANCEL BOOKING - Cancel a booking
// DELETE /api/bookings/:bookingId
// ============================================================
// THINKING: We don't hard-delete bookings. Instead, we change
// the status to "cancelled". This preserves history.
// ============================================================
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM "booking" WHERE "bookingId" = $1',
      [bookingId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Check if booking can be cancelled
    const allowedForCustomer = ['pending', 'accepted'];
    if (req.user.userRole === 'customer' && !allowedForCustomer.includes(existing.rows[0].bookingStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a booking that is ${existing.rows[0].bookingStatus}.`
      });
    }

    if (existing.rows[0].bookingStatus === 'completed' || existing.rows[0].bookingStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a ${existing.rows[0].bookingStatus} booking.`
      });
    }

    // Calculate refund amount based on timing
    const now = new Date();
    // In PostgreSQL, date is returned as Date object, time as string
    const bDate = new Date(existing.rows[0].bookingDate);
    const [bH, bM] = existing.rows[0].bookingStartTime.split(':').map(Number);
    const bookingDateTime = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate(), bH, bM);
    
    const diffInMilliseconds = bookingDateTime - now;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    let refundMultiplier = 0;
    let cancelReason = 'Customer cancellation';

    if (diffInHours >= 24) {
      refundMultiplier = 1.0;
      cancelReason = 'Cancellation (> 24h notice)';
    } else if (diffInHours > 0) {
      refundMultiplier = 0.5;
      cancelReason = 'Late cancellation (< 24h notice)';
    } else {
      refundMultiplier = 0.0;
      cancelReason = 'Cancellation after scheduled time';
    }

    // Set status to cancelled
    await pool.query(
      'UPDATE "booking" SET "bookingStatus" = \'cancelled\' WHERE "bookingId" = $1',
      [bookingId]
    );

    // Process refund if there is a paid invoice
    if (refundMultiplier > 0) {
      const invoiceRes = await pool.query(
        `SELECT "invoiceId", "invoiceAmount" FROM "invoice" 
         WHERE "bookingId" = $1 AND "invoiceStatus" = 'paid'`,
        [bookingId]
      );

      if (invoiceRes.rows.length > 0) {
        const invoice = invoiceRes.rows[0];
        const refundAmount = invoice.invoiceAmount * refundMultiplier;
        
        await pool.query(
          `INSERT INTO "refund" ("refundAmount", "refundReason", "refundStatus", "invoiceId")
           VALUES ($1, $2, 'pending', $3)`,
          [refundAmount, cancelReason, invoice.invoiceId]
        );
      }
    }

    // Log cancellation
    await pool.query(
      `INSERT INTO "bookingHistory"
       ("bookingHistoryAction", "bookingId", "userId")
       VALUES ('cancelled', $1, $2)`,
      [bookingId, req.user.userId]
    );

    return res.status(200).json({
      success: true,
      data: { 
        message: 'Booking cancelled successfully.',
        refundPercentage: (refundMultiplier * 100) + '%'
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel booking.' });
  }
};

module.exports = { addBooking, viewBooking, viewAllBookings, updateBooking, cancelBooking };