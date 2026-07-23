import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  ratingScore: {
    type: Number,
    required: true,
    min: 1, // Puanlama 1'den küçük olamaz
    max: 5  // Puanlama 5'ten büyük olamaz
  },
  feedbackText: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'customer_experiences' });

const Experience = mongoose.model('Experience', experienceSchema, 'customer_experiences');
export default Experience;
