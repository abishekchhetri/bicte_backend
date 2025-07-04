const express = require('express');
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/notes'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.test(ext) ? cb(null, true) : cb(new Error('Only PDF/JPG/PNG files allowed!'));
  }
});

// Upload note (Teacher only)
router.post('/upload', protect('teacher'), upload.single('note'), async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      semester: req.body.semester,
      uploadedBy: req.user.id,
      status: 'pending'
    });
    await newNote.save();
    res.status(200).json({ message: 'Note uploaded, awaiting admin approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get approved notes (student, teacher, admin)
router.get('/all', protect(['student', 'teacher', 'admin']), async (req, res) => {
  try {
    const notes = await Note.find({ status: 'approved' }).sort({ uploadedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending', protect('admin'), async (req, res) => {
  try {
    const pendingNotes = await Note.find({ status: 'pending' }).populate('uploadedBy', 'username');
    res.status(200).json(pendingNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: approve or reject note
router.patch('/approve/:id', protect('admin'), async (req, res) => {
  try {
    const { status } = req.body; // approved or rejected
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.status = status;
    await note.save();
    res.status(200).json({ message: `Note ${status}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
