const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: process.env.DB_URL,   // ✅ MUST BE THIS
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("MySQL connected successfully 🚀");

module.exports = pool;