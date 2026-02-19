const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function debug() {
    const email = 'admin@seatslabs.com';
    const pass = 'password123';
    const res = await pool.query('SELECT * FROM "user" WHERE "userEmail" = $1', [email]);
    if (res.rows.length === 0) { console.log('No user'); return; }
    const user = res.rows[0];
    console.log('User Email:', user.userEmail);
    console.log('Hash in DB:', user.userPassword);
    const match = await bcrypt.compare(pass, user.userPassword);
    console.log('Bcrypt Match:', match);
    await pool.end();
}
debug();
