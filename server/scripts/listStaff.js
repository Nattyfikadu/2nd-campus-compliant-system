const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaints';

async function listStaff() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'campus_complaints',
    });
    console.log('✅ Connected to MongoDB');

    // Find all users with role 'staff'
    const staffUsers = await User.find({ role: 'staff' }, 'fullName email password role');

    if (staffUsers.length === 0) {
      console.log('No staff users found in the database.');
    } else {
      console.log('Staff users:');
      staffUsers.forEach(user => {
        console.log(`Name: ${user.fullName}, Email: ${user.email}, Password (hashed): ${user.password}, Role: ${user.role}`);
      });
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

listStaff();