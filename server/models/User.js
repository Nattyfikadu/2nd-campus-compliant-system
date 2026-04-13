const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },  // unique handled inline
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'visitor', 'staff', 'office', 'admin'],
      required: true,
    },
    // Student-specific fields
    studentId: { type: String, unique: true, sparse: true },
    phone: { type: String },
    department: { type: String },
    faculty: { type: String },
    // Staff-specific fields
    staffId: { type: String, unique: true, sparse: true },
    position: { type: String }, // Job title/position for staff
    staffLocations: {
      type: [String],
      enum: ['cafeteria', 'dormitory', 'registrar', 'hr-office', 'faculty', 'library'],
      default: [],
    },
    staffApproved: { type: Boolean, default: false }, // Only applies to role='staff'
    staffRejected: { type: Boolean, default: false }, // Only applies to role='staff'
    staffRejectionReason: { type: String }, // Only applies to role='staff'
    // Visitor-specific (minimal)
    // They can optionally provide email/phone for notifications
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Only add indexes not already declared inline above
UserSchema.index({ role: 1, staffApproved: 1, staffRejected: 1 });

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // Skip hashing if password is already hashed (starts with $2a$, $2b$, or $2y$)
  if (this.password && this.password.startsWith('$2')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Shape document for frontend (remove password, use id instead of _id)
UserSchema.method('toClient', function () {
  const obj = this.toObject({ versionKey: false });
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.password;
  return obj;
});

module.exports = mongoose.model('User', UserSchema);
