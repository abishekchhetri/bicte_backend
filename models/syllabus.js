
const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  title: String,
  filePath: String,
  semester: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
