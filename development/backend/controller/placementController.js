const pool = require('../config/database');

const getAllPlacements = async (req, res) => {
    try {
        const result = await pool.query('SELECT "advertisementPlacementId", "advertisementPlacementSlug", "advertisementPlacementName", "advertisementPlacementPage", "advertisementPlacementPosition", "advertisementPlacementDescription", "advertisementPlacementWidth", "advertisementPlacementHeight", "advertisementPlacementPrice", "advertisementPlacementIsFixed", "advertisementPlacementCreatedAt" FROM "advertisementPlacement" ORDER BY "advertisementPlacementCreatedAt" DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get all placements error:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

const createPlacement = async (req, res) => {
    const {
        advertisementPlacementSlug,
        advertisementPlacementName,
        advertisementPlacementPage,
        advertisementPlacementPosition,
        advertisementPlacementDescription,
        advertisementPlacementWidth,
        advertisementPlacementHeight,
        advertisementPlacementPrice
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO "advertisementPlacement"
            ("advertisementPlacementSlug", "advertisementPlacementName", "advertisementPlacementPage", "advertisementPlacementPosition", "advertisementPlacementDescription", "advertisementPlacementWidth", "advertisementPlacementHeight", "advertisementPlacementPrice")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [advertisementPlacementSlug, advertisementPlacementName, advertisementPlacementPage, advertisementPlacementPosition, advertisementPlacementDescription, advertisementPlacementWidth, advertisementPlacementHeight, advertisementPlacementPrice]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create placement error:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

const updatePlacement = async (req, res) => {
    const { id } = req.params;
    const {
        advertisementPlacementSlug,
        advertisementPlacementName,
        advertisementPlacementPage,
        advertisementPlacementPosition,
        advertisementPlacementDescription,
        advertisementPlacementWidth,
        advertisementPlacementHeight,
        advertisementPlacementPrice
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE "advertisementPlacement" SET
            "advertisementPlacementSlug" = COALESCE($1, "advertisementPlacementSlug"),
            "advertisementPlacementName" = COALESCE($2, "advertisementPlacementName"),
            "advertisementPlacementPage" = COALESCE($3, "advertisementPlacementPage"),
            "advertisementPlacementPosition" = COALESCE($4, "advertisementPlacementPosition"),
            "advertisementPlacementDescription" = COALESCE($5, "advertisementPlacementDescription"),
            "advertisementPlacementWidth" = COALESCE($6, "advertisementPlacementWidth"),
            "advertisementPlacementHeight" = COALESCE($7, "advertisementPlacementHeight"),
            "advertisementPlacementPrice" = COALESCE($8, "advertisementPlacementPrice")
            WHERE "advertisementPlacementId" = $9 RETURNING *`,
            [advertisementPlacementSlug, advertisementPlacementName, advertisementPlacementPage, advertisementPlacementPosition, advertisementPlacementDescription, advertisementPlacementWidth, advertisementPlacementHeight, advertisementPlacementPrice, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Placement not found.' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Update placement error:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

const deletePlacement = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "advertisementPlacement" WHERE "advertisementPlacementId" = $1', [id]);
        res.status(200).json({ success: true, message: 'Placement deleted.' });
    } catch (error) {
        console.error('Delete placement error:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

module.exports = {
    getAllPlacements,
    createPlacement,
    updatePlacement,
    deletePlacement
};
