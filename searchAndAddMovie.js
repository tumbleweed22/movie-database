require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise');
const readline = require('readline');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Terminal input setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for movie title
rl.question('🎬 Enter a movie title: ', async (movieTitle) => {
  try {
    // Step 1: Search TMDb for the movie
    const searchRes = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle
      }
    });

    const results = searchRes.data.results;
    if (results.length === 0) {
      console.log('❌ No movie found.');
      rl.close();
      return;
    }

    const firstResult = results[0];

    // Step 2: Get full movie details
    const movieId = firstResult.id;
    const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,videos'
      }
    });

    const movie = movieRes.data;

    // Step 3: Extract data
    const title = movie.title;
    const year = parseInt(movie.release_date?.slice(0, 4)) || null;
    const length_minutes = movie.runtime || null;
    const summary = movie.overview || '';
    const genre = movie.genres.map(g => g.name).join(', ');
    const actors = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    const trailerObj = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const trailer_url = trailerObj ? `https://www.youtube.com/watch?v=${trailerObj.key}` : '';

    // Step 4: Connect to DB and insert
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    const sql = `
      INSERT INTO movies 
      (title, year, length_minutes, summary, genre, actors, watched, date_watched, trailer_url, rating, format_type, ownership_info, tv_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      year,
      length_minutes,
      summary,
      genre,
      actors,
      false,
      null,
      trailer_url,
      null,
      'Film',
      '',
      null
    ];

    await connection.execute(sql, values);
    await connection.end();

    console.log(`✅ "${title}" added to your database!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    rl.close();
  }
});
