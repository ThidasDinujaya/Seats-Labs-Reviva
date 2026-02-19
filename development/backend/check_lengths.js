const pool = require('./config/database');
async function check() {
    const res = await pool.query('SELECT "userEmail", LENGTH("userEmail") as email_len, "userPassword", LENGTH("userPassword") as pass_len FROM "user"');
    console.log(res.rows);
    await pool.end();
}
check();
