import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  isAdult: { type: Boolean, default: false },
  variants: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  price: { type: Number }, // Standard fallback price if no variants
  description: { type: String },
  ingredients: [{ type: String }],
  label: { type: String, default: 'AS Collections' },
  image: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);