const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  semester: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
