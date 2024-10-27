const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Validate input fields
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Server error: Failed to register user' });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server error: JWT secret is not configured' });
    }

    // Create and sign a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set JWT in a cookie, HttpOnly for security
    res.cookie('token', token, {
      httpOnly: true,  // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production',  // Set to true if using HTTPS
      sameSite: 'strict',  // Prevents CSRF attacks
      maxAge: 3600000,  // 1 hour in milliseconds
    });

    // Return user details without the token
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      message: 'Logged in successfully',
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error: Failed to login' });
  }
});

// Logout route to clear the JWT cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// JWT Verification Endpoint
router.get('/verify', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      id: decoded.id,
      role: decoded.role,
    };

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Route to return the current logged-in user's information
router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      id: decoded.id,
      role: decoded.role,
    };

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

module.exports = router;
