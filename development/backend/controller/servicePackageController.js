const pool = require('../config/database');

// GET ALL PACKAGES
const getAllPackages = async (req, res) => {
    try {
        // We want to return packages along with the services they contains
        const query = `
            SELECT sp.*, 
                   json_agg(json_build_object('serviceId', s."serviceId", 'serviceName', s."serviceName", 'servicePrice', s."servicePrice")) as services
            FROM "servicePackage" sp
            LEFT JOIN "servicePackageItem" spi ON sp."servicePackageId" = spi."servicePackageId"
            LEFT JOIN "service" s ON spi."serviceId" = s."serviceId"
            WHERE sp."servicePackageIsActive" = true
            GROUP BY sp."servicePackageId"
            ORDER BY sp."servicePackageName" ASC
        `;
        const result = await pool.query(query);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get packages error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch packages.' });
    }
};

// CREATE PACKAGE
const createPackage = async (req, res) => {
    const { servicePackageName, servicePackageDescription, servicePackagePrice, serviceIds } = req.body;
    if (!servicePackageName || !servicePackagePrice) return res.status(400).json({ success: false, error: 'Name and price are required.' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const pkgRes = await client.query(
            'INSERT INTO "servicePackage" ("servicePackageName", "servicePackageDescription", "servicePackagePrice") VALUES ($1, $2, $3) RETURNING *',
            [servicePackageName, servicePackageDescription, servicePackagePrice]
        );
        const packageId = pkgRes.rows[0].servicePackageId;

        if (serviceIds && Array.isArray(serviceIds)) {
            for (const serviceId of serviceIds) {
                await client.query(
                    'INSERT INTO "servicePackageItem" ("servicePackageId", "serviceId") VALUES ($1, $2)',
                    [packageId, serviceId]
                );
            }
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true, data: pkgRes.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create package error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create package.' });
    } finally {
        client.release();
    }
};

// UPDATE PACKAGE
const updatePackage = async (req, res) => {
    const { id } = req.params;
    const { servicePackageName, servicePackageDescription, servicePackagePrice, serviceIds, servicePackageIsActive } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        await client.query(
            `UPDATE "servicePackage" SET 
                "servicePackageName" = COALESCE($1, "servicePackageName"),
                "servicePackageDescription" = COALESCE($2, "servicePackageDescription"),
                "servicePackagePrice" = COALESCE($3, "servicePackagePrice"),
                "servicePackageIsActive" = COALESCE($4, "servicePackageIsActive"),
                "servicePackageUpdatedAt" = CURRENT_TIMESTAMP
             WHERE "servicePackageId" = $5`,
            [servicePackageName, servicePackageDescription, servicePackagePrice, servicePackageIsActive, id]
        );

        if (serviceIds && Array.isArray(serviceIds)) {
            // Refresh services
            await client.query('DELETE FROM "servicePackageItem" WHERE "servicePackageId" = $1', [id]);
            for (const serviceId of serviceIds) {
                await client.query(
                    'INSERT INTO "servicePackageItem" ("servicePackageId", "serviceId") VALUES ($1, $2)',
                    [id, serviceId]
                );
            }
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Package updated successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update package error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update package.' });
    } finally {
        client.release();
    }
};

// DELETE PACKAGE (Soft delete)
const deletePackage = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE "servicePackage" SET "servicePackageIsActive" = false WHERE "servicePackageId" = $1', [id]);
        return res.status(200).json({ success: true, message: 'Package deleted successfully.' });
    } catch (error) {
        console.error('Delete package error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete package.' });
    }
};

module.exports = {
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage
};
