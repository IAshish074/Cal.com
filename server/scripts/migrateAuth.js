const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateAuth() {
  try {
    const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.DB_URL;
    if (!dbUrl) {
      throw new Error('No database URL found. Set MYSQL_URL, DATABASE_URL, or DB_URL.');
    }
    const connection = await mysql.createConnection(dbUrl);

    console.log('Checking if password column exists in users table...');
    
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'password'`);
    if (columns.length === 0) {
      console.log('Adding password column...');
      await connection.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255)`);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      console.log('Seeding existing users with default password "password"...');
      await connection.query(`UPDATE users SET password = ? WHERE password IS NULL`, [hashedPassword]);
    } else {
      console.log('Password column already exists. Skipping migration.');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateAuth();
