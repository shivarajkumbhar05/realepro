const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'complete'], default: 'pending' },
  completedAt: Date,
}, { _id: false });

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, trim: true, maxlength: 500 },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true, unique: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agreedPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['offer_accepted', 'documents_pending', 'contract_pending', 'payment_pending', 'inspection_pending', 'completed', 'cancelled', 'disputed'],
    default: 'offer_accepted',
  },
  milestones: { type: [milestoneSchema], default: [] },
  history: { type: [historySchema], default: [] },
}, { timestamps: true });

transactionSchema.index({ buyer: 1, updatedAt: -1 });
transactionSchema.index({ agent: 1, updatedAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
