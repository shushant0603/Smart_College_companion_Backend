import express from 'express';
import { protect } from '../middleware/auth.js';
import Event from '../models/Event.js';

const router = express.Router();

// Get all events for a user
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id })
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new event
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, date, type, location } = req.body;

    const event = await Event.create({
      user: req.user._id,
      title,
      description,
      date,
      type,
      location,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming', protect, async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      user: req.user._id,
      date: { $gte: currentDate },
    }).sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 