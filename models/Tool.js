import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  toolName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true // Eklendiğinde varsayılan olarak aktif başlar
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'bluebot_tools' });

const Tool = mongoose.model('Tool', toolSchema, 'bluebot_tools');
export default Tool;
