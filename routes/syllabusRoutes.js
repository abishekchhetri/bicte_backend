const express = require('express');
const multer = require('multer');
const path = require('path');
const Syllabus = require('../models/Syllabus');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/syllabus'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.test(ext) ? cb(null, true) : cb(new Error('Only PDF/JPG/PNG files allowed!'));
  }
});

// Upload syllabus (Teacher only)
router.post('/upload', protect('teacher'), upload.single('syllabus'), async (req, res) => {
  try {
    const newSyllabus = new Syllabus({
      subject: req.body.subject,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      semester: req.body.semester,
      uploadedBy: req.user.id,
      status: 'pending'
    });
    await newSyllabus.save();
    res.status(200).json({ message: 'Syllabus uploaded, awaiting admin approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get approved syllabus (student, teacher, admin)
router.get('/all', protect(['student', 'teacher', 'admin']), async (req, res) => {
  try {
    const syllabusList = await Syllabus.find({ status: 'approved' }).sort({ uploadedAt: -1 });
    res.status(200).json(syllabusList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all pending syllabus
router.get('/pending', protect('admin'), async (req, res) => {
  try {
    const pendingSyllabus = await Syllabus.find({ status: 'pending' }).populate('uploadedBy', 'username');
    res.status(200).json(pendingSyllabus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: approve or reject syllabus
router.patch('/approve/:id', protect('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });

    syllabus.status = status;
    await syllabus.save();
    res.status(200).json({ message: `Syllabus ${status}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
