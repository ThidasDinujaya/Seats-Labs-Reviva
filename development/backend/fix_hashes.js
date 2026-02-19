const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function fix() {
    const hash = (await bcrypt.hash('password123', 10)).trim();
    console.log('New Hash:', hash, 'Length:', hash.length);
    await pool.query('UPDATE "user" SET "userPassword" = $1', [hash]);
    console.log('Fixed');
    await pool.end();
}
fix();
