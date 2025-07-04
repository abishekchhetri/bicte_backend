require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const modelPaperRoutes = require('./routes/modelPaperRoutes');

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/modelpapers', modelPaperRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bicteHub';


mongoose.connect(MONGO_URI)

.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
