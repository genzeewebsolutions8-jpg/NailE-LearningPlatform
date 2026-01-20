// index.js

// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
<<<<<<< HEAD
=======
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import User model and middleware
const User = require('./models/User');
const { authenticateToken, isAdmin, JWT_SECRET } = require('./middleware/auth');
>>>>>>> d050c08 (Update for frontend of login and signup for Admin, Tutor and End User without database)

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests (from frontend)
app.use(bodyParser.json()); // Parse JSON request bodies

<<<<<<< HEAD
// Test route
app.get('/', (req, res) => {
  res.send('Nail E-Learning Backend is running!');
=======
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naile-platform';

// MongoDB connection with options
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000 // Close sockets after 45s of inactivity
})
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Create pre-configured admin if it doesn't exist
    await createPreConfiguredAdmin();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n⚠️  Please make sure MongoDB is running:');
    console.error('   1. Local MongoDB: Start MongoDB service');
    console.error('   2. MongoDB Atlas: Update MONGODB_URI in .env file');
    console.error('\n   Current URI:', MONGODB_URI);
  });

// Function to create pre-configured admin
async function createPreConfiguredAdmin() {
  try {
    const adminEmail = 'hetthakkar544@gmail.com';
    const adminPassword = 'Het@1234';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword,
        phone: '+1234567890',
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Pre-configured admin created successfully!');
      console.log(`   Email: ${adminEmail}`);
    } else {
      // Update password in case it changed
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('✅ Pre-configured admin exists and updated.');
    }
  } catch (error) {
    console.error('Error creating pre-configured admin:', error);
  }
}

// Middleware to check MongoDB connection
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database not connected. Please check MongoDB connection.' 
    });
  }
  next();
};

// Test route
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    message: 'Nail E-Learning Backend is running!',
    database: dbStatus
  });
});

// Registration endpoint (for regular users)
app.post('/api/auth/register', checkDatabaseConnection, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user with default role 'user'
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/auth/login', checkDatabaseConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, checkDatabaseConnection, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tutor registration endpoint (admin only)
app.post('/api/auth/register-tutor', authenticateToken, isAdmin, checkDatabaseConnection, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new tutor
    const tutor = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'tutor'
    });

    await tutor.save();

    res.status(201).json({
      message: 'Tutor registered successfully',
      tutor: {
        id: tutor._id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: tutor.email,
        phone: tutor.phone,
        role: tutor.role,
        createdAt: tutor.createdAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Tutor registration error:', error);
    res.status(500).json({ message: 'Server error during tutor registration' });
  }
});

// Check if admin exists (for first-time setup)
app.get('/api/auth/check-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({ adminExists: adminCount > 0 });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// First-time admin creation (only if no admin exists)
app.post('/api/auth/create-first-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.countDocuments({ role: 'admin' });
    if (adminExists > 0) {
      return res.status(403).json({ message: 'Admin already exists. Please login instead.' });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create first admin user
    const admin = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'admin'
    });

    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
});

// Get all tutors (admin only)
app.get('/api/tutors', authenticateToken, isAdmin, checkDatabaseConnection, async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
>>>>>>> d050c08 (Update for frontend of login and signup for Admin, Tutor and End User without database)
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
