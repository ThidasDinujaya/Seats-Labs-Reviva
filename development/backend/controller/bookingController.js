const pool = require('../config/database');

const generateRefNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SL-${dateStr}-${random}`;
};

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

    if (!bookingDate || !timeSlotId || !customerId || !vehicleId || (!serviceId && !servicePackageId)) {
      return res.status(400).json({
        success: false,
        error: 'bookingDate, timeSlotId, customerId, vehicleId, and either serviceId or servicePackageId are required.'
      });
    }

    const slotResult = await pool.query(
      'SELECT "timeSlotStartTime", "timeSlotMaxCapacity" FROM "timeSlot" WHERE "timeSlotId" = $1 AND "timeSlotIsActive" = true',
      [timeSlotId]
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive time slot selected.' });
    }

    const { timeSlotStartTime, timeSlotMaxCapacity } = slotResult.rows[0];

    const bookingStartTime = timeSlotStartTime;

    let serviceDuration = 0;
    if (serviceId) {
        const serviceResult = await pool.query(
          'SELECT "serviceDuration" FROM "service" WHERE "serviceId" = $1',
          [serviceId]
        );
        if (serviceResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Service not found.' });
        serviceDuration = serviceResult.rows[0].serviceDuration;
    } else {
        serviceDuration = 120;
    }

    const [hours, minutes] = bookingStartTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + serviceDuration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const bookingEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

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

    const bookingRefNumber = generateRefNumber();

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

    let finalAmount = 0;
    if (serviceId) {
        const sRes = await pool.query('SELECT "servicePrice" FROM "service" WHERE "serviceId" = $1', [serviceId]);
        finalAmount = sRes.rows[0].servicePrice;
    } else {
        const pRes = await pool.query('SELECT "servicePackagePrice" FROM "servicePackage" WHERE "servicePackageId" = $1', [servicePackageId]);
        finalAmount = pRes.rows[0].servicePackagePrice;
    }

    const invoiceNumber = `INV-${newBooking.bookingRefNumber}`;
    await pool.query(
        `INSERT INTO "invoice" ("invoiceNumber", "invoiceAmount", "invoiceStatus", "bookingId")
         VALUES ($1, $2, 'pending', $3)`,
        [invoiceNumber, finalAmount, newBooking.bookingId]
    );

    await pool.query(
      `INSERT INTO "serviceTracking"
       ("serviceTrackingStatus", "bookingId")
       VALUES ('booked', $1)`,
      [newBooking.bookingId]
    );

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

const viewBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {

    const result = await pool.query(
      `SELECT b."bookingId", b."bookingDate", b."bookingStartTime", b."bookingEndTime", b."bookingStatus", b."bookingRefNumber", b."customerId", b."vehicleId", b."serviceId", b."servicePackageId", b."technicianId", b."timeSlotId", b."bookingCreatedAt",
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

const viewAllBooking = async (req, res) => {
  const { status, date, customerId, technicianId } = req.query;

  try {

    let query = `
      SELECT b."bookingId", b."bookingDate", b."bookingStartTime", b."bookingEndTime", b."bookingStatus", b."bookingRefNumber", b."customerId", b."vehicleId", b."serviceId", b."servicePackageId", b."technicianId", b."timeSlotId", b."bookingCreatedAt",
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
    console.error('View all booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch booking.' });
  }
};

const updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  let { bookingStatus, technicianId, bookingDate, timeSlotId, bookingCustomerNotes, bookingTechnicianNotes, vehicleId } = req.body;

  if (bookingStatus === '') bookingStatus = null;
  if (technicianId === '') technicianId = null;
  if (bookingDate === '') bookingDate = null;
  if (timeSlotId === '') timeSlotId = null;
  if (vehicleId === '') vehicleId = null;

  try {

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

    if (existing.bookingStatus !== 'pending' && req.user.userRole === 'customer') {
        return res.status(400).json({
            success: false,
            error: `Cannot update a booking that is ${existing.bookingStatus}.`
        });
    }

    let startTime = existing.bookingStartTime;
    let endTime = existing.bookingEndTime;

    if (timeSlotId && timeSlotId !== existing.timeSlotId) {
        const slotResult = await pool.query(
            'SELECT "timeSlotStartTime" FROM "timeSlot" WHERE "timeSlotId" = $1',
            [timeSlotId]
        );
        if (slotResult.rows.length > 0) {
            startTime = slotResult.rows[0].timeSlotStartTime;

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

    const action = bookingStatus ? `status_changed_to_${bookingStatus}` : 'updated';
    await pool.query(
      `INSERT INTO "bookingHistory"
       ("bookingHistoryAction", "bookingId", "userId")
       VALUES ($1, $2, $3)`,
      [action, bookingId, req.user.userId]
    );

    if (bookingStatus && bookingStatus !== existing.bookingStatus) {
      await pool.query(
        `INSERT INTO "serviceTracking"
         ("serviceTrackingStatus", "bookingId")
         VALUES ($1, $2)`,
        [bookingStatus, bookingId]
      );

      if (bookingStatus === 'rejected') {

        const invoiceRes = await pool.query(
          `SELECT "invoiceId", "invoiceAmount" FROM "invoice"
           WHERE "bookingId" = $1 AND "invoiceStatus" = 'paid'`,
          [bookingId]
        );

        if (invoiceRes.rows.length > 0) {
          const invoice = invoiceRes.rows[0];

          await pool.query(
            `INSERT INTO "refund" ("refundAmount", "refundReason", "refundStatus", "invoiceId")
             VALUES ($1, $2, 'pending', $3)`,
            [invoice.invoiceAmount, 'Booking rejected by workshop', invoice.invoiceId]
          );

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

    const now = new Date();

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

    await pool.query(
      'UPDATE "booking" SET "bookingStatus" = \'cancelled\' WHERE "bookingId" = $1',
      [bookingId]
    );

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

module.exports = { addBooking, viewBooking, viewAllBooking, updateBooking, cancelBooking };
