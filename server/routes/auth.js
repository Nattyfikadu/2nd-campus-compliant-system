const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

// Simple Student ID validation based on Ethiopian calendar rules
// Example ID: 1205001 -> 12 (year), 05 (month), 001 (student number)
// Rules:
// - Exactly 7 digits
// - Month between 01 and 12
// - Join year must not be more than MAX_STUDY_YEARS behind CURRENT_EC_YEAR
const CURRENT_EC_YEAR = 2018;
const MAX_STUDY_YEARS = 6;

function validateStudentId(studentId) {
  if (!/^\d{7}$/.test(studentId)) {
    return { valid: false, error: 'Invalid student ID format. Use 7 digits like 1205001.' };
  }

  const yearPart = parseInt(studentId.substring(0, 2), 10);
  const monthPart = parseInt(studentId.substring(2, 4), 10);

  if (Number.isNaN(yearPart) || Number.isNaN(monthPart)) {
    return { valid: false, error: 'Invalid student ID format.' };
  }

  if (monthPart < 1 || monthPart > 12) {
    return { valid: false, error: 'Invalid month in student ID. Month must be between 01 and 12.' };
  }

  const joinYear = 2000 + yearPart;
  const studyDuration = CURRENT_EC_YEAR - joinYear;

  if (studyDuration < 0) {
    return { valid: false, error: 'Student ID has a future join year, which is invalid.' };
  }

  if (studyDuration > MAX_STUDY_YEARS) {
    return {
      valid: false,
      error: 'Student ID expired. Only current students (within 6 years) can register.',
    };
  }

  return { valid: true };
}

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
      staffLocations,
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Role-specific validation
    if (role === 'student' && !studentId) {
      return res.status(400).json({ error: 'Student ID is required for students' });
    }

    if (role === 'student' && studentId) {
      const { valid, error } = validateStudentId(studentId);
      if (!valid) {
        return res.status(400).json({ error });
      }
    }

    if (role === 'staff' && !staffId) {
      return res.status(400).json({ error: 'Staff ID is required for staff' });
    }

    if (role === 'staff') {
      const locations = Array.isArray(staffLocations) ? staffLocations : [];
      if (locations.length === 0) {
        return res.status(400).json({
          error: 'Staff must select at least one working location (e.g., dormitory, cafeteria).',
        });
      }
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
      userData.staffLocations = Array.isArray(staffLocations) ? staffLocations : [];
      userData.staffApproved = false;
      userData.staffRejected = false;
      userData.staffRejectionReason = undefined;
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

    // Staff must be approved by office/admin
    if (user.role === 'staff') {
      if (user.staffRejected) {
        const reason = user.staffRejectionReason || 'No rejection reason provided.';
        return res.status(403).json({ error: `Staff registration rejected: ${reason}` });
      }
      if (!user.staffApproved) {
        return res.status(403).json({ error: 'Staff account is not approved yet.' });
      }
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

// Staff routes:
// - GET /api/auth/staff?location=... -> approved staff (optionally filtered)
// - GET /api/auth/staff/pending -> staff awaiting approval
// - PATCH /api/auth/staff/:id/approve -> approve staff

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

router.get('/staff', async (req, res) => {
  try {
    const { location } = req.query;
    const filter = { role: 'staff', staffApproved: true, staffRejected: false };
    if (typeof location === 'string' && location.trim()) {
      filter.staffLocations = { $in: [location] };
    }

    const staff = await User.find(filter).select('-password');
    res.json(staff.map((d) => d.toClient()));
  } catch (err) {
    console.error('Error fetching approved staff:', err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.get('/staff/pending', async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', staffApproved: false, staffRejected: false }).select('-password');
    res.json(staff.map((d) => d.toClient()));
  } catch (err) {
    console.error('Error fetching pending staff:', err);
    res.status(500).json({ error: 'Failed to fetch pending staff' });
  }
});

router.patch('/staff/:id/approve', async (req, res) => {
  try {
    const { actorRole } = req.body;
    if (actorRole !== 'office' && actorRole !== 'admin') {
      return res.status(403).json({ error: 'Only office/admin can approve staff.' });
    }

    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ error: 'Staff not found' });
    }

    staff.staffApproved = true;
    staff.staffRejected = false;
    staff.staffRejectionReason = undefined;
    await staff.save();

    res.json(staff.toClient());
  } catch (err) {
    console.error('Error approving staff:', err);
    res.status(500).json({ error: 'Failed to approve staff' });
  }
});

// Reject staff registration with a required reason
router.patch('/staff/:id/reject', async (req, res) => {
  try {
    const { actorRole, rejectionReason } = req.body;
    if (actorRole !== 'office' && actorRole !== 'admin') {
      return res.status(403).json({ error: 'Only office/admin can reject staff.' });
    }
    if (!rejectionReason || !String(rejectionReason).trim()) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ error: 'Staff not found' });
    }

    staff.staffApproved = false;
    staff.staffRejected = true;
    staff.staffRejectionReason = String(rejectionReason).trim();
    await staff.save();

    res.json(staff.toClient());
  } catch (err) {
    console.error('Error rejecting staff:', err);
    res.status(500).json({ error: 'Failed to reject staff' });
  }
});

// Change password (logged-in user)
router.patch('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Forgot password — send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    if (process.env.BREVO_USER && process.env.BREVO_SMTP_KEY) {
      const transporter = getTransporter();
      const { error: sendError } = await transporter.sendMail({
        from: `"Campus Complaint System" <${process.env.BREVO_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>Hi ${user.fullName},</p>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}" style="color:#2563eb">Reset my password</a></p>
          <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `,
      }).then(() => ({ error: null })).catch(e => ({ error: e }));

      if (sendError) {
        console.error('Email error:', sendError.message);
        return res.json({ message: 'Email delivery failed. Use the link below.', resetUrl });
      }
      console.log('✅ Reset email sent to:', user.email);
    } else {
      console.log('🔑 Password reset link (no email configured):', resetUrl);
      return res.json({ message: 'Email not configured. Use the link below.', resetUrl });
    }

    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    console.error('Forgot password error:', err.message || err);
    res.status(500).json({ error: 'Failed to process request', detail: err.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
