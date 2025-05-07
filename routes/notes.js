import express from 'express';
import { protect } from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = express.Router();

// Get all notes for a user
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new note
router.post('/', protect, async (req, res) => {
  try {
    const { subject, title, content, tags } = req.body;

    const note = await Note.create({
      user: req.user._id,
      subject,
      title,
      content,
      summary: content.substring(0, 150) + '...', // Simple summary
      tags,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update note
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // If content is updated, update summary
    if (req.body.content && req.body.content !== note.content) {
      req.body.summary = req.body.content.substring(0, 150) + '...';
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate summary for a note
router.post('/:id/summarize', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.summary = note.content.substring(0, 500) + '...';
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error regenerating summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 