const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');  // For password hashing

// Middleware to check if the user is an Admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
}

// Update username, role, first name, and last name of a user (Admin Only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { firstName, lastName, username, role } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided in the request body
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;
    user.role = role || user.role;

    // Save the updated user
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Route to create a new user (Admin Only)
router.post('/', auth, isAdmin, async (req, res) => {
  const { username, password, role, firstName, lastName } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,  // Save hashed password
      role,
      firstName,
      lastName,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Delete a user by ID (Admin Only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
});

// Get all users (Admins Only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude the password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user count (Admins Only)
router.get('/count', auth, isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments(); // Get total number of users
    res.json({ count: userCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
