const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const {
    userEmail,
    userPassword,
    userRole,
    customerFirstName,
    customerLastName,
    customerPhone,
    customerAddress,
    advertiserBusinessName,
    advertiserContactPerson,
    advertiserPhone,
    advertiserAddress,
    technicianFirstName,
    technicianLastName,
    technicianPhone,
    managerFirstName,
    managerLastName,
    managerPhone
  } = req.body;

  const finalEmail = userEmail;
  const finalPassword = userPassword;
  const finalRole = userRole;

  try {

    const existingUser = await pool.query(
      'SELECT "userId" FROM "user" WHERE "userEmail" = $1',
      [finalEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO "user" ("userEmail", "userPassword", "userRole")
         VALUES ($1, $2, $3)
         RETURNING "userId", "userEmail", "userRole"`,
        [finalEmail, hashedPassword, finalRole]
      );

      const newUser = userResult.rows[0];
      let roleId = null;
      let roleIdKey = '';

      if (finalRole === 'customer') {
        const res = await client.query(
          `INSERT INTO "customer"
           ("customerFirstName", "customerLastName", "customerPhone", "customerAddress", "userId")
           VALUES ($1, $2, $3, $4, $5) RETURNING "customerId"`,
          [customerFirstName, customerLastName, customerPhone, customerAddress, newUser.userId]
        );
        roleId = res.rows[0].customerId;
        roleIdKey = 'customerId';
      } else if (finalRole === 'advertiser') {
        const res = await client.query(
          `INSERT INTO "advertiser"
           ("advertiserBusinessName", "advertiserContactPerson", "advertiserPhone", "advertiserAddress", "userId")
           VALUES ($1, $2, $3, $4, $5) RETURNING "advertiserId"`,
          [advertiserBusinessName, advertiserContactPerson, advertiserPhone, advertiserAddress, newUser.userId]
        );
        roleId = res.rows[0].advertiserId;
        roleIdKey = 'advertiserId';
      } else if (finalRole === 'technician') {
        const res = await client.query(
          `INSERT INTO "technician"
           ("technicianFirstName", "technicianLastName", "technicianPhone", "userId")
           VALUES ($1, $2, $3, $4) RETURNING "technicianId"`,
          [technicianFirstName, technicianLastName, technicianPhone, newUser.userId]
        );
        roleId = res.rows[0].technicianId;
        roleIdKey = 'technicianId';
      } else if (finalRole === 'manager') {
        const res = await client.query(
          `INSERT INTO "manager"
           ("managerFirstName", "managerLastName", "managerPhone", "userId")
           VALUES ($1, $2, $3, $4) RETURNING "managerId"`,
          [managerFirstName, managerLastName, managerPhone, newUser.userId]
        );
        roleId = res.rows[0].managerId;
        roleIdKey = 'managerId';
      }

      const payload = {
        userId: newUser.userId,
        userEmail: newUser.userEmail,
        userRole: newUser.userRole,
        userName: (customerFirstName ? `${customerFirstName} ${customerLastName}` : (advertiserBusinessName || finalEmail)).trim()
      };
      if (roleIdKey) payload[roleIdKey] = roleId;

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        data: {
          ...newUser,
          [roleIdKey]: roleId,
          token: token
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

const login = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {

    let userQuery = '';
    if (userEmail) {

      const initialResult = await pool.query('SELECT * FROM "user" WHERE "userEmail" = $1', [userEmail]);
      if (initialResult.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
      const u = initialResult.rows[0];

      if (u.userRole === 'customer') {
        userQuery = `SELECT u.*, c.*
                     FROM "user" u JOIN "customer" c ON u."userId" = c."userId"
                     WHERE u."userEmail" = $1`;
      } else if (u.userRole === 'manager') {
        userQuery = `SELECT u.*, m.*
                     FROM "user" u JOIN "manager" m ON u."userId" = m."userId"
                     WHERE u."userEmail" = $1`;
      } else if (u.userRole === 'technician') {
        userQuery = `SELECT u.*, t.*
                     FROM "user" u JOIN "technician" t ON u."userId" = t."userId"
                     WHERE u."userEmail" = $1`;
      } else if (u.userRole === 'advertiser') {
        userQuery = `SELECT u.*, a.*
                     FROM "user" u JOIN "advertiser" a ON u."userId" = a."userId"
                     WHERE u."userEmail" = $1`;
      } else {
        userQuery = `SELECT * FROM "user" WHERE "userEmail" = $1`;
      }
    }

    const userResult = await pool.query(userQuery, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];

    if (!user.userIsActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated.'
      });
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const userName = user.customerFirstName
      ? `${user.customerFirstName} ${user.customerLastName}`
      : user.managerFirstName
      ? `${user.managerFirstName} ${user.managerLastName}`
      : user.technicianFirstName
      ? `${user.technicianFirstName} ${user.technicianLastName}`
      : user.advertiserBusinessName
      ? user.advertiserBusinessName
      : user.userEmail;

    const token = jwt.sign(
      {
        userId: user.userId,
        userEmail: user.userEmail,
        userRole: user.userRole,
        userName: userName.trim(),
        customerId: user.customerId,
        advertiserId: user.advertiserId,
        managerId: user.managerId,
        technicianId: user.technicianId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { userPassword: _, ...userData } = user;
    return res.status(200).json({
      success: true,
      data: {
        ...userData,
        token: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.userRole;

    let userQuery = '';
    if (userRole === 'customer') {
      userQuery = `SELECT u."userId", u."userEmail", u."userRole", c."customerId", c."customerFirstName", c."customerLastName", c."customerPhone", c."customerAddress"
                   FROM "user" u JOIN "customer" c ON u."userId" = c."userId"
                   WHERE u."userId" = $1`;
    } else if (userRole === 'manager') {
      userQuery = `SELECT u."userId", u."userEmail", u."userRole", m."managerId", m."managerFirstName", m."managerLastName", m."managerPhone"
                   FROM "user" u JOIN "manager" m ON u."userId" = m."userId"
                   WHERE u."userId" = $1`;
    } else if (userRole === 'technician') {
      userQuery = `SELECT u."userId", u."userEmail", u."userRole", t."technicianId", t."technicianFirstName", t."technicianLastName", t."technicianPhone", t."technicianSpecialization"
                   FROM "user" u JOIN "technician" t ON u."userId" = t."userId"
                   WHERE u."userId" = $1`;
    } else if (userRole === 'advertiser') {
      userQuery = `SELECT u."userId", u."userEmail", u."userRole", a."advertiserId", a."advertiserContactPerson", a."advertiserBusinessName", a."advertiserPhone", a."advertiserAddress"
                   FROM "user" u JOIN "advertiser" a ON u."userId" = a."userId"
                   WHERE u."userId" = $1`;
    } else {
      userQuery = `SELECT "userId", "userEmail", "userRole" FROM "user" WHERE "userId" = $1`;
    }

    const result = await pool.query(userQuery, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};

module.exports = { register, login, getMe };
