const express = require('express');
const Complaint = require('../models/Complaint');

const router = express.Router();

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const docs = await Complaint.find().sort({ createdAt: -1 });
    res.json(docs.map((c) => c.toClient()));
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get complaints by submitter
router.get('/user/:userId', async (req, res) => {
  try {
    const docs = await Complaint.find({ 'submittedBy.id': req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(docs.map((c) => c.toClient()));
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// Get complaints by assignee
router.get('/assignee/:assigneeId', async (req, res) => {
  try {
    const docs = await Complaint.find({ 'assignedTo.id': req.params.assigneeId }).sort({
      createdAt: -1,
    });
    res.json(docs.map((c) => c.toClient()));
  } catch (err) {
    console.error('Error fetching assignee complaints:', err);
    res.status(500).json({ error: 'Failed to fetch assignee complaints' });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { title, description, category, location, submittedBy } = req.body;
    if (!title || !description || !category || !location || !submittedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      submittedBy,
      status: 'pending',
    });

    const saved = await complaint.save();
    res.status(201).json(saved.toClient());
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Update complaint status / assignment / rejection
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, assignedTo, rejectionReason } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const update = {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
    };

    if (assignedTo) {
      update.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      update.resolvedAt = new Date();
    }

    const updated = await Complaint.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(updated.toClient());
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

module.exports = router;

