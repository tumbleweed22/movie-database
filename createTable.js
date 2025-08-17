require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INT,
        length_minutes INT,
        summary TEXT,
        genre VARCHAR(100),
        actors TEXT,
        watched BOOLEAN DEFAULT FALSE,
        date_watched DATE DEFAULT NULL,
        trailer_url VARCHAR(255),
        rating TINYINT UNSIGNED DEFAULT NULL,
        format_type ENUM('TV', 'Film') DEFAULT 'Film',
        ownership_info VARCHAR(100),
        tv_status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await connection.query(createTableSQL);
    console.log('✅ Table "movies" created successfully (or already exists).');
    await connection.end();
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
  }
}

createTable();
