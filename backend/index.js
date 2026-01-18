// index.js

// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests (from frontend)
app.use(bodyParser.json()); // Parse JSON request bodies

// Test route
app.get('/', (req, res) => {
  res.send('Nail E-Learning Backend is running!');
});

// Example API route
app.get('/api/courses', (req, res) => {
  // This will eventually return courses from your database
  res.json([
    { id: 1, title: 'Basic Nail Art', duration: '30 mins' },
    { id: 2, title: 'Advanced Nail Design', duration: '45 mins' }
  ]);
});

// Placeholder for live session route
app.get('/api/live-sessions', (req, res) => {
  res.json([
    { id: 1, title: 'Live Acrylic Nails Class', status: 'upcoming' }
  ]);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
