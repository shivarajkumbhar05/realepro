const Transaction = require('../models/Transaction');
const Purchase = require('../models/Purchase');
const Notification = require('../models/Notification');

const milestoneKeys = [
  ['documents', 'Documents verified'],
  ['contract', 'Agreement signed'],
  ['payment', 'Payment or escrow funded'],
  ['inspection', 'Inspection completed'],
  ['settlement', 'Settlement completed'],
];

const statusTransitions = {
  offer_accepted: ['documents_pending', 'cancelled', 'disputed'],
  documents_pending: ['contract_pending', 'cancelled', 'disputed'],
  contract_pending: ['payment_pending', 'cancelled', 'disputed'],
  payment_pending: ['inspection_pending', 'cancelled', 'disputed'],
  inspection_pending: ['completed', 'cancelled', 'disputed'],
  disputed: ['documents_pending', 'contract_pending', 'payment_pending', 'inspection_pending', 'cancelled'],
};

const createMilestones = () => milestoneKeys.map(([key, label]) => ({ key, label }));

const populateTransaction = (query) => query
  .populate('property', 'title price status images location')
  .populate('buyer', 'name email phone')
  .populate('agent', 'name email phone')
  .populate('purchase', 'offerPrice message createdAt');

const canAccess = (transaction, user) => user.role === 'admin'
  || transaction.buyer._id?.toString() === user.id
  || transaction.agent._id?.toString() === user.id
  || transaction.buyer.toString?.() === user.id
  || transaction.agent.toString?.() === user.id;

exports.createFromPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found.' });
    if (purchase.status !== 'accepted') return res.status(400).json({ success: false, message: 'Only accepted offers can become transactions.' });
    if (req.user.role !== 'admin' && purchase.buyer.toString() !== req.user.id && purchase.agent.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to create this transaction.' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { purchase: purchase._id },
      {
        $setOnInsert: {
          property: purchase.property,
          purchase: purchase._id,
          buyer: purchase.buyer,
          agent: purchase.agent,
          agreedPrice: purchase.offerPrice,
          milestones: createMilestones(),
          history: [{ status: 'offer_accepted', note: 'Offer accepted and transaction opened.', changedBy: req.user.id }],
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: await populateTransaction(Transaction.findById(transaction._id)) });
  } catch (error) {
    if (error.code === 11000) {
      const transaction = await Transaction.findOne({ purchase: req.params.purchaseId });
      return res.status(200).json({ success: true, data: await populateTransaction(Transaction.findById(transaction._id)) });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { $or: [{ buyer: req.user.id }, { agent: req.user.id }] };
    const transactions = await populateTransaction(Transaction.find(query).sort({ updatedAt: -1 }));
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await populateTransaction(Transaction.findById(req.params.id));
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (!canAccess(transaction, req.user)) return res.status(403).json({ success: false, message: 'You are not authorized to view this transaction.' });
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const allowed = ['documents_pending', 'contract_pending', 'payment_pending', 'inspection_pending', 'completed', 'cancelled', 'disputed'];
    const { status, note } = req.body;
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid transaction status.' });

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    const isAgentOrAdmin = transaction.agent.toString() === req.user.id || req.user.role === 'admin';
    const isParticipant = isAgentOrAdmin || transaction.buyer.toString() === req.user.id;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this transaction.' });
    }
    if (['completed', 'cancelled'].includes(transaction.status)) return res.status(409).json({ success: false, message: 'This transaction is already closed.' });
    if (!statusTransitions[transaction.status]?.includes(status)) {
      return res.status(409).json({ success: false, message: `Cannot move a transaction from ${transaction.status.replaceAll('_', ' ')} to ${status.replaceAll('_', ' ')}.` });
    }
    if (status === 'completed' && !isAgentOrAdmin) {
      return res.status(403).json({ success: false, message: 'Only the agent or an admin can complete a transaction.' });
    }

    transaction.status = status;
    transaction.history.push({ status, note: note || `Transaction moved to ${status.replaceAll('_', ' ')}.`, changedBy: req.user.id });
    const milestoneMap = { documents_pending: 'documents', contract_pending: 'contract', payment_pending: 'payment', inspection_pending: 'inspection', completed: 'settlement' };
    const milestoneKey = milestoneMap[status];
    if (milestoneKey) {
      transaction.milestones = transaction.milestones.map((milestone) => {
        if (milestone.key === milestoneKey) return { ...milestone.toObject(), status: 'complete', completedAt: new Date() };
        return milestone;
      });
    }
    await transaction.save();

    const recipient = transaction.buyer.toString() === req.user.id ? transaction.agent : transaction.buyer;
    await Notification.create({ recipient, type: 'purchase_status', title: 'Transaction updated', message: `Your transaction moved to ${status.replaceAll('_', ' ')}.`, purchase: transaction.purchase, property: transaction.property });
    res.json({ success: true, data: await populateTransaction(Transaction.findById(transaction._id)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
