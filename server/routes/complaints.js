const express = require('express');
const Complaint = require('../models/Complaint');
const { upload } = require('../config/cloudinary');

const router = express.Router();

function generateTrackingCode() {
  // cryptographically secure random 5-digit number
  const num = require('crypto').randomInt(10000, 99999);
  return `CMP-${num}`;
}

// Map a lean mongo doc or Mongoose doc to client shape
function toClient(c) {
  const obj = c.toObject ? c.toObject({ versionKey: false }) : { ...c };
  obj.id = (obj._id || obj.id).toString();
  delete obj._id;
  return obj;
}

// Get all complaints (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Complaint.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(),
    ]);

    res.json({
      data: docs.map((c) => ({ ...c, id: c._id.toString(), _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get complaints by submitter
router.get('/user/:userId', async (req, res) => {
  try {
    const docs = await Complaint.find({ 'submittedBy.id': req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(docs.map((c) => ({ ...c, id: c._id.toString(), _id: undefined })));
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// Get complaints by assignee
router.get('/assignee/:assigneeId', async (req, res) => {
  try {
    const docs = await Complaint.find({ 'assignedTo.id': req.params.assigneeId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(docs.map((c) => ({ ...c, id: c._id.toString(), _id: undefined })));
  } catch (err) {
    console.error('Error fetching assignee complaints:', err);
    res.status(500).json({ error: 'Failed to fetch assignee complaints' });
  }
});

// Create a new complaint (JSON body, no files — files uploaded separately)
router.post('/', async (req, res) => {
  try {
    const { title, description, category, location, submittedBy } = req.body;
    if (!title || !description || !category || !location || !submittedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const complaint = new Complaint({
      type: 'student',
      title,
      description,
      category,
      location,
      submittedBy,
      status: 'pending',
    });

    const saved = await complaint.save();
    res.status(201).json(toClient(saved));
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Public: create anonymous complaint with optional file attachments
router.post('/anonymous', upload.array('files', 5), async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = req.body.category || 'other';
    const location = req.body.location || 'unknown';

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Generate unique tracking code
    let trackingCode = generateTrackingCode();
    while (await Complaint.exists({ trackingCode })) {
      trackingCode = generateTrackingCode();
    }

    // Files are already uploaded to Cloudinary by multer-storage-cloudinary
    const attachments = (req.files || []).map((file) => ({
      url: file.path || file.secure_url,
      type: file.mimetype.startsWith('video') ? 'video'
          : file.mimetype.startsWith('audio') ? 'audio'
          : 'image',
      originalName: file.originalname,
    }));

    const complaint = new Complaint({
      type: 'anonymous',
      trackingCode,
      title,
      description,
      category,
      location,
      submittedBy: { id: 'anonymous', name: 'Anonymous', email: '' },
      status: 'pending',
      attachments,
    });

    const saved = await complaint.save();
    res.status(201).json({ message: 'Complaint submitted', trackingCode, complaint: toClient(saved) });
  } catch (err) {
    console.error('Error creating anonymous complaint:', err);
    res.status(500).json({ error: 'Failed to submit anonymous complaint' });
  }
});

// Public: track complaint by tracking code
router.get('/track/:trackingCode', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ trackingCode: req.params.trackingCode }).lean();
    if (!complaint) {
      return res.status(404).json({ error: 'Tracking code not found' });
    }
    res.json({
      trackingCode: complaint.trackingCode,
      status: complaint.status,
      title: complaint.title,
      category: complaint.category,
      location: complaint.location,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      resolvedAt: complaint.resolvedAt,
      rejectionReason: complaint.rejectionReason,
      attachments: complaint.attachments || [],
    });
  } catch (err) {
    console.error('Error tracking complaint:', err);
    res.status(500).json({ error: 'Failed to track complaint' });
  }
});

// Update complaint status / assignment / resolution / escalation
router.patch('/:id/status', async (req, res) => {
  try {
    const {
      status, assignedTo, rejectionReason,
      resolutionDescription, resolutionAttachments,
      escalationType, escalationReason, escalationReportedBy,
      supportStaffAdd,
    } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const update = { status };

    if (rejectionReason !== undefined) update.rejectionReason = rejectionReason;
    else if (status !== 'rejected') update.rejectionReason = undefined;

    if (resolutionDescription !== undefined) update.resolutionDescription = resolutionDescription;
    else if (status !== 'resolved') update.resolutionDescription = undefined;

    if (resolutionAttachments !== undefined) update.resolutionAttachments = resolutionAttachments;
    else if (status !== 'resolved') update.resolutionAttachments = undefined;

    if (escalationType !== undefined) update.escalationType = escalationType;
    if (escalationReason !== undefined) update.escalationReason = escalationReason;
    if (escalationReportedBy !== undefined) update.escalationReportedBy = escalationReportedBy;
    if (assignedTo) update.assignedTo = assignedTo;
    if (status === 'resolved') update.resolvedAt = new Date();

    let updated = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true, returnDocument: 'after' });

    if (!updated) return res.status(404).json({ error: 'Complaint not found' });

    // Add support staff without replacing primary assignee
    if (supportStaffAdd?.id && supportStaffAdd?.name) {
      const existsInSupport = (updated.supportStaff || []).some((s) => s.id === supportStaffAdd.id);
      const isPrimary = updated.assignedTo?.id === supportStaffAdd.id;
      if (!existsInSupport && !isPrimary) {
        updated.supportStaff = [...(updated.supportStaff || []), supportStaffAdd];
        await updated.save();
      }
    }

    res.json(toClient(updated));
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

// Delete a complaint (only pending complaints can be deleted by submitter)
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.status !== 'pending') {
      return res.status(403).json({ error: 'Only pending complaints can be withdrawn' });
    }
    await complaint.deleteOne();
    res.json({ message: 'Complaint withdrawn successfully' });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ error: 'Failed to withdraw complaint' });
  }
});

module.exports = router;
