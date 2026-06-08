import mongoose from 'mongoose';

const whatsappLogSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Guest' },
  customerPhone: { type: String },
  productName: { type: String, required: true },
  variantSize: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('WhatsAppLog', whatsappLogSchema);
