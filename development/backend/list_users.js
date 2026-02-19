const pool = require('./config/database');
async function list() {
    const r = await pool.query('SELECT "userEmail", "userRole", "userIsActive" FROM "user"');
    console.log(r.rows);
    await pool.end();
}
list();
