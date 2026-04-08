const mongoose = require('mongoose');

const SubmittedBySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: false },
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

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // /uploads/filename.ext
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    originalName: { type: String, required: true },
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['student', 'visitor', 'anonymous'],
      default: 'student',
      required: true,
    },
    trackingCode: { type: String },
    studentId: { type: String },
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
        'other',
      ],
      required: true,
    },
    location: {
      type: String,
      enum: ['cafeteria', 'dormitory', 'registrar', 'hr-office', 'faculty', 'library', 'unknown'],
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
    supportStaff: { type: [AssignedToSchema], default: [] },
    rejectionReason: { type: String },
    escalationType: {
      type: String,
      enum: ['unavailable', 'beyond-skill'],
      required: false,
    },
    escalationReason: { type: String },
    escalationReportedBy: { type: AssignedToSchema, required: false },
    resolutionDescription: { type: String },
    resolutionAttachments: { type: [AttachmentSchema], default: [] },
    resolvedAt: { type: Date },
    attachments: { type: [AttachmentSchema], default: [] },
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

