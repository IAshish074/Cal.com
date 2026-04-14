const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  try {
 
    const connection = await mysql.createConnection(process.env.DB_URL);
    console.log('Connected to database via DB_URL.');

 
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

 
    await connection.query(`
      CREATE TABLE IF NOT EXISTS availability_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        timezone VARCHAR(255) DEFAULT 'UTC',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS availability_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        schedule_id INT NOT NULL,
        day_of_week INT NOT NULL, -- 0 (Mon) to 6 (Sun) or similar convention
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        FOREIGN KEY (schedule_id) REFERENCES availability_schedules(id) ON DELETE CASCADE
      )
    `);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type_id INT NOT NULL,
        booker_name VARCHAR(255) NOT NULL,
        booker_email VARCHAR(255) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status ENUM('upcoming', 'past', 'cancelled') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
      )
    `);

 
    const [users] = await connection.query('SELECT * FROM users WHERE id = 1');
    if (users.length === 0) {
      await connection.query(`
        INSERT INTO users (username, email) VALUES ('admin', 'admin@calclone.com')
      `);
      console.log('Default user seeded.');
      
 
      const [scheduleResult] = await connection.query(`
        INSERT INTO availability_schedules (user_id, name, timezone, is_default) 
        VALUES (1, 'Working Hours', 'UTC', TRUE)
      `);
      
      const scheduleId = scheduleResult.insertId;
      

      for(let i=0; i<5; i++) {
        await connection.query(`
          INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time)
          VALUES (?, ?, '09:00:00', '17:00:00')
        `, [scheduleId, i]); // 0=Mon, 1=Tue etc up to 4=Fri
      }
      console.log('Default availability seeded.');
    }

    console.log('Database initialization successful!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database at initDB.js:', error);
    process.exit(1);
  }
}

initDB();
