// backend/src/models/ChatSession.ts
import mongoose from 'mongoose';
const ChatSessionSchema = new mongoose.Schema({
  userId:    { type: String }, // si quieres asociar a usuarios autenticados
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('ChatSession', ChatSessionSchema);
