// backend/src/models/MetricEvent.ts
import mongoose from 'mongoose';
const MetricEventSchema = new mongoose.Schema({
  type:     { type: String, required: true },
  data:     { type: mongoose.Schema.Types.Mixed },
  createdAt:{ type: Date, default: Date.now }
});
export default mongoose.model('MetricEvent', MetricEventSchema);

