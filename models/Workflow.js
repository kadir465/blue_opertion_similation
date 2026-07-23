import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  nodes: {
    type: Array,
    required: true
  },
  connections: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
