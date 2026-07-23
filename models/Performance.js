import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
  subject: { type: String, required: true },       // Konu
  category: { type: String, required: true },      // Kategori
  building: { type: String, required: true },      // Bina
  zone: { type: String, required: true },          // Bölge
  duration: { type: String },                      // Süre
  createdAt: { type: Date, default: Date.now }
}, { collection: 'customer_performances' });

const Performance = mongoose.model('Performance', performanceSchema, 'customer_performances');
export default Performance;
