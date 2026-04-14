const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.DB_URL,   // ✅ THIS IS KEY FIX
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// test connection (optional but useful)
(async () => {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log("MySQL connected successfully 🚀");
  } catch (err) {
    console.error("DB Connection Error ❌", err);
  }
})();

module.exports = pool;