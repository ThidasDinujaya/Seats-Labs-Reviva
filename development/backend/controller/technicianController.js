const pool = require('../config/database');
const bcrypt = require('bcrypt');

const addTechnician = async (req, res) => {
  const {
    technicianFirstName,
    technicianLastName,
    technicianPhone,
    technicianSpecialization,
    userEmail,
    userPassword
  } = req.body;

  try {

    if (!technicianFirstName || !technicianLastName || !userEmail || !userPassword) {
      return res.status(400).json({
        success: false,
        error: 'technicianFirstName, technicianLastName, userEmail, and userPassword are required.'
      });
    }

    const existing = await pool.query(
      'SELECT "userId" FROM "user" WHERE "userEmail" = $1',
      [userEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const userResult = await pool.query(
      `INSERT INTO "user" ("userEmail", "userPassword", "userRole")
       VALUES ($1, $2, 'technician')
       RETURNING "userId"`,
      [userEmail, hashedPassword]
    );

    const userId = userResult.rows[0].userId;

    const techResult = await pool.query(
      `INSERT INTO "technician"
       ("technicianFirstName", "technicianLastName", "technicianPhone",
        "technicianSpecialization", "userId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [technicianFirstName, technicianLastName, technicianPhone,
       technicianSpecialization, userId]
    );

    return res.status(201).json({
      success: true,
      data: { ...techResult.rows[0], userEmail }
    });
  } catch (error) {
    console.error('Add technician error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add technician.' });
  }
};

const viewTechnician = async (req, res) => {
  const { technicianId } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.*, u."userEmail"
       FROM "technician" t
       JOIN "user" u ON t."userId" = u."userId"
       WHERE t."technicianId" = $1`,
      [technicianId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Technician not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('View technician error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch technician.' });
  }
};

const viewAllTechnician = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u."userEmail", u."userIsActive"
       FROM "technician" t
       JOIN "user" u ON t."userId" = u."userId"
       WHERE u."userIsActive" = true
       ORDER BY t."technicianFirstName" ASC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all technician error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch technician.' });
  }
};

const updateTechnician = async (req, res) => {
  const { technicianId } = req.params;
  const { technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM "technician" WHERE "technicianId" = $1',
      [technicianId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Technician not found.' });
    }

    const result = await pool.query(
      `UPDATE "technician" SET
        "technicianFirstName" = COALESCE($1, "technicianFirstName"),
        "technicianLastName" = COALESCE($2, "technicianLastName"),
        "technicianPhone" = COALESCE($3, "technicianPhone"),
        "technicianSpecialization" = COALESCE($4, "technicianSpecialization")
       WHERE "technicianId" = $5
       RETURNING *`,
      [technicianFirstName, technicianLastName, technicianPhone, technicianSpecialization, technicianId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update technician error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update technician.' });
  }
};

const deleteTechnician = async (req, res) => {
  const { technicianId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT "userId" FROM "technician" WHERE "technicianId" = $1',
      [technicianId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Technician not found.' });
    }

    await pool.query(
      'UPDATE "user" SET "userIsActive" = false WHERE "userId" = $1',
      [existing.rows[0].userId]
    );

    return res.status(200).json({
      success: true,
      data: { message: 'Technician deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete technician error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete technician.' });
  }
};

module.exports = { addTechnician, viewTechnician, viewAllTechnician, updateTechnician, deleteTechnician };
