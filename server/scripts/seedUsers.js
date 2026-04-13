const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ override: true });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaints';

const defaultUsers = [
  {
    fullName: 'Tigist Haile',
    email: 'office@campus.edu',
    password: 'password',
    role: 'office',
    department: 'Registrar',
  },
  {
    fullName: 'Admin User',
    email: 'admin@campus.edu',
    password: 'password',
    role: 'admin',
    department: 'Administration',
  },
  {
    fullName: 'Lemma Teshome',
    email: 'staff@campus.edu',
    password: 'password',
    role: 'staff',
    staffId: '1000001',
    position: 'Maintenance Staff',
    staffLocations: ['dormitory', 'cafeteria'],
    staffApproved: true,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'campus_complaints',
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing default users (optional - comment out if you want to keep existing data)
    const emails = defaultUsers.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('🧹 Cleared existing default users');

    // Create default users
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Let the pre-save hook handle hashing
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Default users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Office Account:');
    console.log('  Email: office@campus.edu');
    console.log('  Password: password');
    console.log('\nAdmin Account:');
    console.log('  Email: admin@campus.edu');
    console.log('  Password: password');
    console.log('\nStaff Account (approved for testing):');
    console.log('  Email: staff@campus.edu');
    console.log('  Password: password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
}

seedUsers();
