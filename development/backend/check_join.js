const pool = require('./config/database');

async function check() {
  try {
    const query = `
      SELECT b.*, c."customerFirstName", c."customerLastName"
      FROM "booking" b
      JOIN "customer" c ON b."customerId" = c."customerId"
      LIMIT 1
    `;
    const res = await pool.query(query);
    console.log('Sample Row:', JSON.stringify(res.rows[0], null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
