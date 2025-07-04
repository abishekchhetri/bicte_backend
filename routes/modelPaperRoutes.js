const express = require('express');
const multer = require('multer');
const path = require('path');
const ModelPaper = require('../models/ModelPaper');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/modelpapers'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg files allowed for Model Papers!'));
    }
  }
});

router.post('/upload', protect('teacher'), upload.single('modelPaper'), async (req, res) => {
  try {
    const newModelPaper = new ModelPaper({
      subject: req.body.subject,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      year: req.body.year,
      semester: req.body.semester,
      uploadedBy: req.user.id,
      status: 'pending'
    });
    await newModelPaper.save();
    res.status(200).json({ message: 'Model Paper uploaded, awaiting admin approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', protect(['student', 'teacher', 'admin']), async (req, res) => {
  try {
    const papers = await ModelPaper.find({ status: 'approved' }).sort({ uploadedAt: -1 });
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/pending', protect('admin'), async (req, res) => {
  try {
    const pendingPapers = await ModelPaper.find({ status: 'pending' }).populate('uploadedBy', 'username');
    res.status(200).json(pendingPapers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.patch('/approve/:id', protect('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const paper = await ModelPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Model Paper not found' });

    paper.status = status;
    await paper.save();
    res.status(200).json({ message: `Model Paper ${status}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
