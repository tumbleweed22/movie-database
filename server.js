require('dotenv').config();
const express = require('express');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());



const TMDB_API_KEY = "c430d157063361f687656faf60867611";

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

app.post('/add-movie', async (req, res) => {
  const { tmdbId } = req.body;
  if (!tmdbId) return res.status(400).send('tmdbId required');

  try {
    // Fetch movie details from TMDb
    const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`);

    const movieData = movieRes.data;

    // Extract needed info
    const poster_path = movieData.poster_path || '';
    const title = movieData.title;
    const year = movieData.release_date ? movieData.release_date.slice(0,4) : null;
    const length_minutes = movieData.runtime;
    const summary = movieData.overview;
    const genre = movieData.genres.map(g => g.name).join(', ');
    const actors = movieData.credits.cast.slice(0,5).map(a => a.name).join(', ');
    const watched = false;
    const tv_or_film = 'Film';
    const owned = '';
    const tv_completion_status = '';
    const trailer = '';  // You can fetch this separately if you want

    // Insert into your movies table
const sql = `INSERT INTO movies (title, year, length_minutes, summary, genre, actors, watched, tv_or_film, owned, tv_completion_status, trailer, poster_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.query(sql, [title, year, length_minutes, summary, genre, actors, watched, tv_or_film, owned, tv_completion_status, trailer, poster_path]);

    res.send('Movie added');
  } catch (err) {
  console.error("❌ Error adding movie:", err.message);
  if (err.response) {
    console.error("TMDb response error:", err.response.status, err.response.data);
  } else {
    console.error("Other error:", err);
  }
  res.status(500).send('Failed to add movie');
}
});





// GET all movies
app.get('/movies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM movies ORDER BY title');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update watched status of a movie
app.put('/movies/:id/watched', async (req, res) => {
  const movieId = req.params.id;
  const { watched } = req.body; // expect { watched: true } or { watched: false }

  if (typeof watched !== 'boolean') {
    return res.status(400).send('Invalid watched value');
  }

  try {
    const [result] = await pool.query('UPDATE movies SET watched = ? WHERE id = ?', [watched, movieId]);

    if (result.affectedRows === 0) {
      return res.status(404).send('Movie not found');
    }

    res.send('Watched status updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// TODO: Add other endpoints like PUT, POST, DELETE

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
