import express from 'express';
import { protect } from '../middleware/auth.js';
import Timetable from '../models/Timetable.js';

const router = express.Router();

// Get all timetable entries for a user
router.get('/', protect, async (req, res) => {
  try {
    const timetable = await Timetable.find({ user: req.user._id })
      .sort({ day: 1, startTime: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new timetable entry
router.post('/', protect, async (req, res) => {
  try {
    const { day, startTime, endTime, subject, room, instructor } = req.body;

    const timetable = await Timetable.create({
      user: req.user._id,
      day,
      startTime,
      endTime,
      subject,
      room,
      instructor,
    });

    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update timetable entry
router.put('/:id', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTimetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete timetable entry
router.delete('/:id', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    await timetable.deleteOne();
    res.json({ message: 'Timetable entry removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 