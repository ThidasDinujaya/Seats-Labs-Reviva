const pool = require('../config/database');

const getAllSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "systemSettings"');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get all settings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
};

const getSettingByKey = async (req, res) => {
  const { key } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "systemSettings" WHERE "settingKey" = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found.' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get setting error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch setting.' });
  }
};

const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { settingValue } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "systemSettings"
       SET "settingValue" = $1, "settingUpdatedAt" = CURRENT_TIMESTAMP
       WHERE "settingKey" = $2
       RETURNING *`,
      [settingValue, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update setting error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update setting.' });
  }
};

const initSettingsSchema = async () => {
    try {
        const check = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'systemSettings')`);
        if (!check.rows[0].exists) {
             await pool.query(`
                CREATE TABLE "systemSettings" (
                    "settingId" SERIAL PRIMARY KEY,
                    "settingKey" VARCHAR(100) UNIQUE NOT NULL,
                    "settingValue" TEXT NOT NULL,
                    "settingUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
             `);

             await pool.query(`
                INSERT INTO "systemSettings" ("settingKey", "settingValue") VALUES
                ('contact_address', '123 Automotive Way'),
                ('contact_phone', '+94 11 234 5678'),
                ('contact_email', 'contact@seatslabs.com'),
                ('contact_opening_hours', 'Mon - Sat: 8:00 AM - 6:00 PM')
                ON CONFLICT ("settingKey") DO NOTHING;
             `);
             console.log('Settings table initialized.');
        }
    } catch (e) {
        console.error('Settings init error:', e);
    }
};

const inspectSchema = async () => {
  try {
    const tables = ['booking', 'service', 'payment', 'invoice', 'refund', 'report', 'timeSlot'];
    const results = {};
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
      results[table] = res.rows;
    }
    return results;
  } catch (error) {
    console.error('Inspection error:', error);
    return { error: error.message };
  }
};

const listTables = async () => {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    return res.rows.map(r => r.table_name);
  } catch (err) {
    console.error(err);
    return [];
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  initSettingsSchema,
  inspectSchema,
  listTables
};
