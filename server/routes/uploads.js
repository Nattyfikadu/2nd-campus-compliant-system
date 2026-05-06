const express = require('express');
const Complaint = require('../models/Complaint');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Upload resolution attachments (returns URLs only, not saved to complaint yet)
router.post('/resolution', upload.array('files', 5), async (req, res) => {
  try {
    const attachments = (req.files || []).map((file) => ({
      url: file.path || file.secure_url,  // handle both versions
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
      originalName: file.originalname,
    }));
    res.json({ attachments });
  } catch (err) {
    console.error('Error uploading resolution attachments:', err);
    res.status(500).json({ error: 'Failed to upload resolution attachments' });
  }
});

// Upload attachments and attach to an existing complaint
router.post('/:complaintId', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length > 0) {
      console.log('Upload file keys:', Object.keys(files[0]));
      console.log('Upload file sample:', JSON.stringify(files[0], null, 2));
    }
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const newAttachments = (req.files || []).map((file) => ({
      url: file.path || file.secure_url,  // handle both versions
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
