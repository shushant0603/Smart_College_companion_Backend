import express from 'express';
import { protect } from '../middleware/auth.js';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Get all assignments for a user
router.get('/', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id })
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new assignment
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, subject, dueDate, priority } = req.body;

    const assignment = await Assignment.create({
      user: req.user._id,
      title,
      description,
      subject,
      dueDate,
      priority,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment
router.put('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment
router.delete('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark assignment as complete/incomplete
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = assignment.status === 'completed' ? 'pending' : 'completed';
    await assignment.save();

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 