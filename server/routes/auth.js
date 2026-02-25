const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      studentId,
      staffId,
      phone,
      department,
      faculty,
      position,
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Role-specific validation
    if (role === 'student' && !studentId) {
      return res.status(400).json({ error: 'Student ID is required for students' });
    }

    if (role === 'staff' && !staffId) {
      return res.status(400).json({ error: 'Staff ID is required for staff' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if studentId already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({ error: 'Student ID already registered' });
      }
    }

    // Check if staffId already exists (for staff)
    if (role === 'staff' && staffId) {
      const existingStaffId = await User.findOne({ staffId });
      if (existingStaffId) {
        return res.status(400).json({ error: 'Staff ID already registered' });
      }
    }

    // Create user
    const userData = {
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || undefined,
      department: department || undefined,
      faculty: faculty || undefined,
    };

    if (role === 'student') {
      userData.studentId = studentId;
    }

    if (role === 'staff') {
      userData.staffId = staffId;
      userData.position = position || undefined;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toClient(),
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: user.toClient(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user by ID (for profile, etc.)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.toClient());
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
