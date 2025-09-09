// backend/src/models/ChatMessage.ts
import mongoose from 'mongoose';
const ChatMessageSchema = new mongoose.Schema({
  sessionId:{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
  role:     { type: String, enum: ['user','assistant','system'], required: true },
  content:  { type: String, required: true },
  tokens:   { type: Number }, // opcional, para medir uso de tokens
  createdAt:{ type: Date, default: Date.now }
});
export default mongoose.model('ChatMessage', ChatMessageSchema);
