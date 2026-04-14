const mysql = require('mysql2/promise');

// Railway MySQL provides MYSQL_URL; fallback to DATABASE_URL or DB_URL
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.DB_URL;

let pool;

if (dbUrl) {
  pool = mysql.createPool(dbUrl);
} else if (process.env.MYSQLHOST) {
  // Railway also provides individual env vars
  pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT || '3306', 10),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  console.error('No database connection URL found. Set MYSQL_URL, DATABASE_URL, or DB_URL environment variable.');
  process.exit(1);
}

module.exports = pool;
