const pool = require('./config/database');

async function checkUser() {
    try {
        const res = await pool.query('SELECT "userId", "userEmail", "userPassword" FROM "user" WHERE "userEmail" = $1', ['admin@seatslabs.com']);
        console.log('User Found:', res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUser();
