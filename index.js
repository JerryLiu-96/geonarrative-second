'use strict';

const express = require('express');
const { Pool } = require('pg'); // Using pg for PostgreSQL
const bodyParser = require('body-parser');

const cors = require('cors');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs');

const { S3Client } = require('@aws-sdk/client-s3'); // AWS SDK S3 client
const multerS3 = require('multer-s3'); // multer-s3 connector

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

// --- Configure AWS S3 Client ---
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Handle large JSON data

// --- Configure Multer to use S3 for storage ---
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique file name
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

// Ensure the 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// api endpoint to get Mapbox token
app.get('/api/mapbox-token', (req, res) => {
  res.json({ token: process.env.MAPBOX_ACCESS_TOKEN });
});

// api endpoint to save a story
app.post('/api/save-story', upload.array('images', 10), async (req, res) => {
  const client = await pool.connect();
  try {

    let {words, longitude, latitude} = req.body;
    let files = req.files || [];

    // Instead of local paths, we now get S3 URLs from multer-s3
    const imageUrls = files.map(file => file.location);

    let query = `
      INSERT INTO stories (words, images, location)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
      RETURNING id
    `;
    let values = [words, JSON.stringify(imageUrls), longitude, latitude];
    let result = await client.query(query, values);

    res.status(200).json({ message: 'Story saved successfully!', id: result.rows[0].id });

  } catch (err) {
    console.error('Error saving story:', err);
    res.status(500).send('Error saving story');
  } finally {
    client.release();
  }
})

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

