'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs');

const app = express();
const LINSTENPORT = 3000;

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
      cb(null, uniqueSuffix + '-' + file.originalname); // Generate a unique filename
  }
});
const upload = multer({ storage: storage });

// Ensure the 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// api endpoint to save a story
app.post('/api/save-story', upload.array('images', 10), async (req, res) => {
  try{
    let db = await getDBConnection();
    let {words, longitude, latitude} = req.body;
    let files = req.files || [];

    let imagePaths = files.map(file => file.path);

    let query = `INSERT INTO stories (words, images, lng, lat) VALUES (?, ?, ?, ?)`;
    let values = [words, JSON.stringify(imagePaths), longitude, latitude];
    let result = await db.run(query, values);
    res.type('text').send('Story saved successfully!');
    await db.close();
  } catch (err) {
    console.error('Error saving story:', err);
    res.status(500).send('Error saving story');
  }
})

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'geonarrative.db', // THIS IS NOT THE TABLE NAME
    driver: sqlite3.Database
  });
  return db;
};

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve the frontend files
app.use(express.static('public'));

const PORT = process.env.PORT || LINSTENPORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

