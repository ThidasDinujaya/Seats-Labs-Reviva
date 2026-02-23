const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query('SELECT "customerId", "customerFirstName" FROM "customer" LIMIT 5');
    console.log('Customer table:', JSON.stringify(res.rows, null, 2));

    const res2 = await pool.query('SELECT "bookingId", "customerId" FROM "booking" LIMIT 5');
    console.log('Booking table:', JSON.stringify(res2.rows, null, 2));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
