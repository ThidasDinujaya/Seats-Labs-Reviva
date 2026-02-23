const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const createDatabase = async () => {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres'
    };

    const client = new Client(config);

    try {
        await client.connect();

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Database ${process.env.DB_NAME} not found. Creating...`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`Database ${process.env.DB_NAME} created successfully.`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists.`);
        }
    } catch (err) {
        console.error('FAILED TO CONNECT TO POSTGRES database to create the new DB.');
        console.error('Please check your DB_USER and DB_PASSWORD in .env file.');
        console.error('Error details:', err);
    } finally {
        await client.end();
    }
};

const runSchema = async () => {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    };

    const client = new Client(config);

    try {
        await client.connect();
        console.log(`Connected to ${process.env.DB_NAME}. Running schema...`);

        const schemaPath = path.join(__dirname, 'db', 'complete_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);

        console.log('Schema executed successfully.');
    } catch (err) {
        console.error('Error executing schema:', err);
    } finally {
        await client.end();
    }
};

const setup = async () => {
    await createDatabase();
    await runSchema();
};

setup();
