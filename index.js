'use strict';

const express = require('express');
const { Pool } = require('pg'); // Using pg for PostgreSQL
const bodyParser = require('body-parser');

const cors = require('cors');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs');

// 2. Load environment variables from .env file for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const LINSTENPORT = 3000;

// --- 3. PostgreSQL Connection Pool ---
// The Pool will use the DATABASE_URL from the .env file locally,
// and from Heroku's environment variables when in production.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Handle large JSON data

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Sanitize the original filename: keep only letters, numbers, dots, dashes, and underscores
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, uniqueSuffix + '-' + safeName);
  }
});
const upload = multer({ storage: storage });

// Ensure the 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// api endpoint to save a story
app.post('/api/save-story', upload.array('images', 10), async (req, res) => {
  const client = await pool.connect();
  try {

    let {words, longitude, latitude} = req.body;
    let files = req.files || [];

    let imagePaths = files.map(file => file.path);

    let query = `INSERT INTO stories (words, images, lng, lat) VALUES ($1, $2, $3, $4) RETURNING id`;
    let values = [words, JSON.stringify(imagePaths), longitude, latitude];
    let result = await client.query(query, values);

    res.status(200).json({ message: 'Story saved successfully!', id: result.rows[0].id });

  } catch (err) {
    console.error('Error saving story:', err);
    res.status(500).send('Error saving story');
  } finally {
    client.release();
  }
})

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve the frontend files
app.use(express.static('public'));

const PORT = process.env.PORT || LINSTENPORT;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Optional: Check database connection on startup
    try {
        const client = await pool.connect();
        console.log("Successfully connected to PostgreSQL database.");
        client.release();
    } catch (err) {
        console.error("Failed to connect to the database:", err);
    }
});

