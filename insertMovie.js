require('dotenv').config();
const mysql = require('mysql2/promise');

async function insertMovie() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const movie = {
      title: 'Inception',
      year: 2010,
      length_minutes: 148,
      summary: 'A skilled thief is given a chance at redemption if he can successfully perform inception.',
      genre: 'Sci-Fi',
      actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page',
      watched: true,
      date_watched: '2022-11-20',
      trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      rating: 9,
      format_type: 'Film',
      ownership_info: 'Blu-ray',
      tv_status: null
    };

    const sql = `
      INSERT INTO movies 
      (title, year, length_minutes, summary, genre, actors, watched, date_watched, trailer_url, rating, format_type, ownership_info, tv_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      movie.title,
      movie.year,
      movie.length_minutes,
      movie.summary,
      movie.genre,
      movie.actors,
      movie.watched,
      movie.date_watched,
      movie.trailer_url,
      movie.rating,
      movie.format_type,
      movie.ownership_info,
      movie.tv_status
    ];

    await connection.execute(sql, values);

    console.log('✅ Movie added to the database!');
    await connection.end();
  } catch (err) {
    console.error('❌ Failed to insert movie:', err.message);
  }
}

insertMovie();
