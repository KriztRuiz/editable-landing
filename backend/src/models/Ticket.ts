// backend/src/models/Ticket.ts
import mongoose from 'mongoose';
const TicketSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  message:  { type: String, required: true },
  status:   { type: String, default: 'open', enum: ['open','closed'] },
  createdAt:{ type: Date, default: Date.now }
});
export default mongoose.model('Ticket', TicketSchema);
