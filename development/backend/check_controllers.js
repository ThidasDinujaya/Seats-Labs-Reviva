const pool = require('./config/database');

async function check() {
  try {
    const bReq = `SELECT b."bookingId", b."customerId", c."customerFirstName" FROM "booking" b JOIN "customer" c ON b."customerId" = c."customerId" LIMIT 1`;
    const bRes = await pool.query(bReq);
    console.log('Booking Result:', bRes.rows[0]);

    const fReq = `SELECT f."feedbackId", f."customerId", c."customerFirstName" FROM "feedback" f JOIN "customer" c ON f."customerId" = c."customerId" LIMIT 1`;
    const fRes = await pool.query(fReq);
    console.log('Feedback Result:', fRes.rows[0]);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
