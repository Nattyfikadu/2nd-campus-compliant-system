const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ override: true });
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');
const uploadsRouter = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaints';

// CORS — allow all Vercel preview URLs + specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow all vercel.app subdomains
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow localhost for dev
    if (origin.startsWith('http://localhost')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// Rate limiting — global: 200 req/min per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth routes — 20 req/min per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.set('trust proxy', 1); // Trust Render/Vercel proxy headers
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));

// Static files for uploaded attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/uploads', uploadsRouter);

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    console.log('🔌 Connecting to:', MONGO_URI.substring(0, 40) + '...');
    console.log('☁️  Cloudinary cloud:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
    await mongoose.connect(MONGO_URI, {
      dbName: 'campus_complaints',
    });
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

start();

