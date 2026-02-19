const pool = require('../config/database');

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "serviceCategory" ORDER BY "serviceCategoryName" ASC');
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch categories.' });
    }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
    const { serviceCategoryName, serviceCategoryDescription } = req.body;
    if (!serviceCategoryName) return res.status(400).json({ success: false, error: 'Category name is required.' });

    try {
        const result = await pool.query(
            'INSERT INTO "serviceCategory" ("serviceCategoryName", "serviceCategoryDescription") VALUES ($1, $2) RETURNING *',
            [serviceCategoryName, serviceCategoryDescription]
        );
        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create category.' });
    }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { serviceCategoryName, serviceCategoryDescription, serviceCategoryIsActive } = req.body;

    try {
        const result = await pool.query(
            `UPDATE "serviceCategory" SET 
                "serviceCategoryName" = COALESCE($1, "serviceCategoryName"),
                "serviceCategoryDescription" = COALESCE($2, "serviceCategoryDescription"),
                "serviceCategoryIsActive" = COALESCE($3, "serviceCategoryIsActive")
             WHERE "serviceCategoryId" = $4 RETURNING *`,
            [serviceCategoryName, serviceCategoryDescription, serviceCategoryIsActive, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Category not found.' });
        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Update category error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update category.' });
    }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM "serviceCategory" WHERE "serviceCategoryId" = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Category not found.' });
        return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete category. It might be used by services.' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
