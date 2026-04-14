const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.DB_URL,   // ✅ correct way
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("MySQL connected successfully 🚀");

module.exports = pool;