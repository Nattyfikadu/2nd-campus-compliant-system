const express = require('express');
const Complaint = require('../models/Complaint');
const { upload } = require('../config/cloudinary');

const router = express.Router();

function handleUpload(req, res, next) {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message, '| http_code:', err.http_code, '| full:', JSON.stringify(err));
      return res.status(500).json({ error: 'File upload failed', detail: err.message });
    }
    const files = req.files || [];
    if (files.length > 0) {
      console.log('Uploaded files:', files.length, '| path:', files[0].path, '| secure_url:', files[0].secure_url);
    }
    next();
  });
}

function mapFiles(files) {
  return (files || []).map((file) => ({
    url: file.path || file.secure_url || '',
    type: file.mimetype.startsWith('image') ? 'image' : 'video',
    originalName: file.originalname,
  }));
}

// Upload resolution attachments (returns URLs only)
router.post('/resolution', handleUpload, async (req, res) => {
  try {
    const attachments = mapFiles(req.files);
    res.json({ attachments });
  } catch (err) {
    console.error('Error uploading resolution attachments:', err);
    res.status(500).json({ error: 'Failed to upload resolution attachments' });
  }
});

// Upload attachments and attach to an existing complaint
router.post('/:complaintId', handleUpload, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const newAttachments = mapFiles(req.files);
    complaint.attachments = [...complaint.attachments, ...newAttachments];
    await complaint.save();

    res.json(complaint.toClient());
  } catch (err) {
    console.error('Error uploading attachments:', err);
    res.status(500).json({ error: 'Failed to upload attachments' });
  }
});

module.exports = router;
