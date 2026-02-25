const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'visitor', 'staff', 'office', 'admin'],
      required: true,
    },
    // Student-specific fields
    studentId: { type: String, sparse: true }, // Only for students, unique but sparse
    phone: { type: String },
    department: { type: String },
    faculty: { type: String }, // Alternative to department
    // Staff-specific fields
    staffId: { type: String, sparse: true }, // Only for staff
    position: { type: String }, // Job title/position for staff
    // Visitor-specific (minimal)
    // They can optionally provide email/phone for notifications
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Index for studentId uniqueness (only for students)
UserSchema.index({ studentId: 1 }, { unique: true, sparse: true });
UserSchema.index({ staffId: 1 }, { unique: true, sparse: true });

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
