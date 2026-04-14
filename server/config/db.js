const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cal_clone',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log("Mysql connected successfully")
module.exports = pool;
