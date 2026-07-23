import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Customer = mongoose.model('Customer', customerSchema, 'customers');
export default Customer;
