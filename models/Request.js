import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  subject: { type: String, required: true },       // Talep Adı
  category: { type: String, required: true },      // Kategori
  building: { type: String, required: true },      // Bina
  workOrderNo: { type: String, required: true },   // İş Emri
  duration: { type: String },                      // Süre
  score: { type: Number },                         // Skor
  createdAt: { type: Date, default: Date.now }
}, { collection: 'customer_requests' });

const Request = mongoose.model('Request', requestSchema, 'customer_requests');
export default Request;
