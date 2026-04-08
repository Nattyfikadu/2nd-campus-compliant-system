const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});

// Upload resolution attachments (returns metadata only; does not attach to complaint yet)
router.post('/resolution', upload.array('files', 5), async (req, res) => {
  try {
    const attachments = (req.files || []).map((file) => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
      originalName: file.originalname,
    }));

    res.json({ attachments });
  } catch (err) {
    console.error('Error uploading resolution attachments:', err);
    res.status(500).json({ error: 'Failed to upload resolution attachments' });
  }
});

// Upload attachments for a complaint
router.post('/:complaintId', upload.array('files', 5), async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const newAttachments = (req.files || []).map((file) => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
      originalName: file.originalname,
    }));

    complaint.attachments = [...complaint.attachments, ...newAttachments];
    await complaint.save();

    res.json(complaint.toClient());
  } catch (err) {
    console.error('Error uploading attachments:', err);
    res.status(500).json({ error: 'Failed to upload attachments' });
  }
});

module.exports = router;

