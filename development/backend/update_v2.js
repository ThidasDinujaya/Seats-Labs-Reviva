const pool = require('./config/database');
const hash = '$2b$10$qgsBdUkHgkxlcn8jas6cNujjy8V6C9iuQzUI2CLDkIiouXQKj1kqTu';

async function update() {
    try {
        await pool.query('UPDATE "user" SET "userPassword" = $1', [hash]);
        console.log('Updated');
    } finally {
        await pool.end();
    }
}
update();
