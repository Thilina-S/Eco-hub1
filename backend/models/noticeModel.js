// backend/models/noticeModel.js
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  date: { type: String, required: true },
});

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;  // Default export
