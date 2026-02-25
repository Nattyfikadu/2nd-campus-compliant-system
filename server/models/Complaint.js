const mongoose = require('mongoose');

const SubmittedBySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const AssignedToSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'service-problem',
        'staff-behavior',
        'security-issue',
        'facility-problem',
        'academic-issue',
      ],
      required: true,
    },
    location: {
      type: String,
      enum: ['cafeteria', 'dormitory', 'registrar', 'hr-office', 'faculty', 'library'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
      required: true,
    },
    submittedBy: { type: SubmittedBySchema, required: true },
    assignedTo: { type: AssignedToSchema, required: false },
    rejectionReason: { type: String },
    resolvedAt: { type: Date },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Shape documents for the frontend (id instead of _id)
ComplaintSchema.method('toClient', function () {
  const obj = this.toObject({ versionKey: false });
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
});

module.exports = mongoose.model('Complaint', ComplaintSchema);

