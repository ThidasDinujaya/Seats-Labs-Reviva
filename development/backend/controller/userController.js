// ============================================================
// controllers/userController.js
// PURPOSE: Handles user management operations for admin/manager.
// LOGIC: 
//   - getAllUser(): Fetches all users with their role-specific details
//   - createUser(): Creates a new user (similar to register)
//   - updateUser(): Updates user details (except email)
//   - deleteUser(): Deletes a user
// ============================================================

const pool = require('../config/database');
const bcrypt = require('bcrypt');

// ============================================================
// GET ALL USER
// ============================================================
const getAllUser = async (req, res) => {
    try {
        const query = `
            SELECT 
                u."userId",
                u."userEmail",
                u."userRole",
                u."userIsActive",
                c."customerFirstName",
                c."customerLastName",
                c."customerPhone",
                c."customerAddress",
                t."technicianFirstName",
                t."technicianLastName",
                t."technicianPhone",
                t."technicianSpecialization",
                m."managerFirstName",
                m."managerLastName",
                m."managerPhone",
                a."advertiserBusinessName",
                a."advertiserContactPerson",
                a."advertiserPhone",
                a."advertiserAddress"
            FROM "user" u
            LEFT JOIN "customer" c ON u."userId" = c."userId"
            LEFT JOIN "technician" t ON u."userId" = t."userId"
            LEFT JOIN "manager" m ON u."userId" = m."userId"
            LEFT JOIN "advertiser" a ON u."userId" = a."userId"
            ORDER BY u."userId" ASC
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Detailed GET USERS error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user.'
        });
    }
};

// ============================================================
// CREATE USER
// ============================================================
const createUser = async (req, res) => {
    const {
        userEmail, userPassword, userRole,
        customerFirstName, customerLastName, customerPhone, customerAddress,
        technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization,
        managerFirstName, managerLastName, managerPhone,
        advertiserBusinessName, advertiserContactPerson, advertiserPhone, advertiserAddress
    } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ success: false, error: 'Email, password, and role are required.' });
    }

    const client = await pool.connect();
    try {
        const existing = await client.query('SELECT "userId" FROM "user" WHERE "userEmail" = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.query('BEGIN');

        const userRes = await client.query(
            'INSERT INTO "user" ("userEmail", "userPassword", "userRole") VALUES ($1, $2, $3) RETURNING "userId"',
            [userEmail, hashedPassword, userRole]
        );
        const userId = userRes.rows[0].userId;

        if (userRole === 'customer') {
            await client.query(
                `INSERT INTO "customer" ("customerFirstName", "customerLastName", "customerPhone", "customerAddress", "userId")
                 VALUES ($1, $2, $3, $4, $5)`,
                [customerFirstName, customerLastName, customerPhone, customerAddress, userId]
            );
        } else if (userRole === 'technician') {
            await client.query(
                `INSERT INTO "technician" ("technicianFirstName", "technicianLastName", "technicianPhone", "technicianSpecialization", "userId")
                 VALUES ($1, $2, $3, $4, $5)`,
                [technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization, userId]
            );
        } else if (userRole === 'manager') {
            await client.query(
                `INSERT INTO "manager" ("managerFirstName", "managerLastName", "managerPhone", "userId")
                 VALUES ($1, $2, $3, $4)`,
                [managerFirstName, managerLastName, managerPhone, userId]
            );
        } else if (userRole === 'advertiser') {
            await client.query(
                `INSERT INTO "advertiser" ("advertiserBusinessName", "advertiserContactPerson", "advertiserPhone", "advertiserAddress", "userId")
                 VALUES ($1, $2, $3, $4, $5)`,
                [advertiserBusinessName, advertiserContactPerson, advertiserPhone, advertiserAddress, userId]
            );
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true, message: 'User created successfully', userId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create user.' });
    } finally {
        client.release();
    }
};

// ============================================================
// UPDATE USER
// ============================================================
const updateUser = async (req, res) => {
    const { id } = req.params;
    const {
        customerFirstName, customerLastName, customerPhone, customerAddress,
        technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization,
        managerFirstName, managerLastName, managerPhone,
        advertiserBusinessName, advertiserContactPerson, advertiserPhone, advertiserAddress,
        userRole, userIsActive 
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (userIsActive !== undefined) {
            await client.query('UPDATE "user" SET "userIsActive" = $1 WHERE "userId" = $2', [userIsActive, id]);
        }

        const userRes = await client.query('SELECT "userRole" FROM "user" WHERE "userId" = $1', [id]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const currentRole = userRes.rows[0].userRole;

        if (currentRole === 'customer') {
            await client.query(
                `UPDATE "customer" SET 
                    "customerFirstName" = COALESCE($1, "customerFirstName"),
                    "customerLastName" = COALESCE($2, "customerLastName"),
                    "customerPhone" = COALESCE($3, "customerPhone"),
                    "customerAddress" = COALESCE($4, "customerAddress")
                 WHERE "userId" = $5`,
                [customerFirstName, customerLastName, customerPhone, customerAddress, id]
            );
        } else if (currentRole === 'technician') {
            await client.query(
                `UPDATE "technician" SET 
                    "technicianFirstName" = COALESCE($1, "technicianFirstName"),
                    "technicianLastName" = COALESCE($2, "technicianLastName"),
                    "technicianPhone" = COALESCE($3, "technicianPhone"),
                    "technicianSpecialization" = COALESCE($4, "technicianSpecialization")
                 WHERE "userId" = $5`,
                [technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization, id]
            );
        } else if (currentRole === 'manager') {
            await client.query(
                `UPDATE "manager" SET 
                    "managerFirstName" = COALESCE($1, "managerFirstName"),
                    "managerLastName" = COALESCE($2, "managerLastName"),
                    "managerPhone" = COALESCE($3, "managerPhone")
                 WHERE "userId" = $4`,
                [managerFirstName, managerLastName, managerPhone, id]
            );
        } else if (currentRole === 'advertiser') {
            await client.query(
                `UPDATE "advertiser" SET 
                    "advertiserBusinessName" = COALESCE($1, "advertiserBusinessName"),
                    "advertiserContactPerson" = COALESCE($2, "advertiserContactPerson"),
                    "advertiserPhone" = COALESCE($3, "advertiserPhone"),
                    "advertiserAddress" = COALESCE($4, "advertiserAddress")
                 WHERE "userId" = $5`,
                [advertiserBusinessName, advertiserContactPerson, advertiserPhone, advertiserAddress, id]
            );
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update user.' });
    } finally {
        client.release();
    }
};

// ============================================================
// DELETE USER
// ============================================================
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        await client.query('DELETE FROM "customer" WHERE "userId" = $1', [id]);
        await client.query('DELETE FROM "technician" WHERE "userId" = $1', [id]);
        await client.query('DELETE FROM "manager" WHERE "userId" = $1', [id]);
        await client.query('DELETE FROM "advertiser" WHERE "userId" = $1', [id]);
        
        const result = await client.query('DELETE FROM "user" WHERE "userId" = $1 RETURNING "userId"', [id]);
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete user.' });
    } finally {
        client.release();
    }
};


// ============================================================
// DEBUG: Check Users and Roles
// ============================================================
const debugCheckUsers = async () => {
    try {
        console.log('--- Checking User ---');
        const users = await pool.query('SELECT "userId", "userEmail", "userRole" FROM "user"');
        console.table(users.rows);

        console.log('--- Checking Managers ---');
        const managers = await pool.query('SELECT * FROM "manager"');
        console.table(managers.rows);

        console.log('--- Checking Customers ---');
        const customers = await pool.query('SELECT * FROM "customer"');
        console.table(customers.rows);

        const orphaned = await pool.query(`
            SELECT u."userId", u."userEmail", u."userRole" 
            FROM "user" u
            LEFT JOIN "customer" c ON u."userId" = c."userId"
            LEFT JOIN "technician" t ON u."userId" = t."userId"
            LEFT JOIN "manager" m ON u."userId" = m."userId"
            LEFT JOIN "advertiser" a ON u."userId" = a."userId"
            WHERE c."customerId" IS NULL 
            AND t."technicianId" IS NULL 
            AND m."managerId" IS NULL 
            AND a."advertiserId" IS NULL
            AND u."userRole" != 'admin'
        `);
        
        if (orphaned.rows.length > 0) {
            console.warn('Orphaned Users found (no profile):', orphaned.rows);
        } else {
            console.log('No orphaned users found.');
        }

    } catch (e) {
        console.error('Debug check failed:', e);
    }
};

module.exports = {
    getAllUser,
    createUser,
    updateUser,
    deleteUser,
    debugCheckUsers
};
