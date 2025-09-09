// backend/src/models/Faq.ts
import mongoose from 'mongoose';
const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
  tags:     [{ type: String }],
  createdAt:{ type: Date, default: Date.now }
});
export default mongoose.model('Faq', FaqSchema);
