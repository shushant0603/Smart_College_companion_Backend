import express from 'express';
import { protect } from '../middleware/auth.js';
import Note from '../models/Note.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate summary and key points using Gemini
async function generateAIContent(content) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate summary
    const summaryPrompt = `Generate a concise summary (max 150 words) of the following text:\n\n${content}`;
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();
    
    // Generate key points
    const keyPointsPrompt = `Extract 3-5 key points from the following text:\n\n${content}`;
    const keyPointsResult = await model.generateContent(keyPointsPrompt);
    const keyPoints = keyPointsResult.response.text();
    
    return { summary, keyPoints };
  } catch (error) {
    console.error('Error generating AI content:', error);
    // Fallback to simple summary if AI fails
    return {
      summary: content.substring(0, 150) + '...',
      keyPoints: 'Key points generation failed'
    };
  }
}

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

    // Generate AI content
    const { summary, keyPoints } = await generateAIContent(content);

    const note = await Note.create({
      user: req.user._id,
      subject,
      title,
      content,
      summary,
      keyPoints,
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

    // If content is updated, regenerate AI content
    if (req.body.content && req.body.content !== note.content) {
      const { summary, keyPoints } = await generateAIContent(req.body.content);
      req.body.summary = summary;
      req.body.keyPoints = keyPoints;
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

// Regenerate summary and key points for a note
router.post('/:id/summarize', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { summary, keyPoints } = await generateAIContent(note.content);
    note.summary = summary;
    note.keyPoints = keyPoints;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error regenerating AI content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 