const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaints';

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'campus_complaints',
    });
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

start();

