const pool = require('../config/database');

const viewCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {

    const customerResult = await pool.query(
      `SELECT c.*, u."userEmail"
       FROM "customer" c
       JOIN "user" u ON c."userId" = u."userId"
       WHERE c."customerId" = $1`,
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const vehicleResult = await pool.query(
      'SELECT * FROM "vehicle" WHERE "customerId" = $1',
      [customerId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...customerResult.rows[0],
        vehicles: vehicleResult.rows
      }
    });
  } catch (error) {
    console.error('View customer error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch customer.' });
  }
};

const viewAllCustomer = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u."userEmail", u."userIsActive",
        (SELECT COUNT(*) FROM "booking" WHERE "customerId" = c."customerId") as "totalBookings"
       FROM "customer" c
       JOIN "user" u ON c."userId" = u."userId"
       WHERE u."userIsActive" = true
       ORDER BY c."customerFirstName" ASC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: { total: result.rows.length }
    });
  } catch (error) {
    console.error('View all customers error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch customers.' });
  }
};

const updateCustomer = async (req, res) => {
  const { customerId } = req.params;
  const { customerFirstName, customerLastName, customerPhone, customerAddress } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM "customer" WHERE "customerId" = $1',
      [customerId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const result = await pool.query(
      `UPDATE "customer" SET
        "customerFirstName" = COALESCE($1, "customerFirstName"),
        "customerLastName" = COALESCE($2, "customerLastName"),
        "customerPhone" = COALESCE($3, "customerPhone"),
        "customerAddress" = COALESCE($4, "customerAddress")
       WHERE "customerId" = $5
       RETURNING *`,
      [customerFirstName, customerLastName, customerPhone, customerAddress, customerId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update customer.' });
  }
};

const deleteCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT "userId" FROM "customer" WHERE "customerId" = $1',
      [customerId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    await pool.query(
      'UPDATE "user" SET "userIsActive" = false WHERE "userId" = $1',
      [existing.rows[0].userId]
    );

    return res.status(200).json({
      success: true,
      data: { message: 'Customer deleted successfully.' }
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete customer.' });
  }
};

module.exports = { viewCustomer, viewAllCustomer, updateCustomer, deleteCustomer };
