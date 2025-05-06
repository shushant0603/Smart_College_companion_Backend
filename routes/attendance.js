import express from 'express';
import { protect } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Get all attendance records for a user
router.get('/', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id })
      .sort({ subject: 1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new attendance record
router.post('/', protect, async (req, res) => {
  try {
    const { subject, totalClasses, attendedClasses } = req.body;

    const attendance = await Attendance.create({
      user: req.user._id,
      subject,
      totalClasses,
      attendedClasses,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance record
router.put('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete attendance record
router.delete('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.deleteOne();
    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance for a subject
router.patch('/:id/update', protect, async (req, res) => {
  try {
    const { attended } = req.body;
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.totalClasses += 1;
    if (attended) {
      attendance.attendedClasses += 1;
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 