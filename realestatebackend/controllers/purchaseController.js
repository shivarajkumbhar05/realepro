const Purchase = require('../models/Purchase');
const Property = require('../models/Property');

// ─── @route  POST /api/purchases/property/:propertyId ─────────────────────────
// ─── @access Private (buyer)
exports.createPurchase = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { offerPrice, message, contactPhone } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive || !property.isApproved) {
      return res.status(404).json({ success: false, message: 'Property not available.' });
    }

    if (property.status === 'sold' || property.status === 'rented') {
      return res.status(400).json({ success: false, message: 'This property is no longer available.' });
    }

    const agentId = property.agent._id || property.agent;
    if (agentId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot submit an offer on your own listing.' });
    }

    const purchase = await Purchase.create({
      property: propertyId,
      buyer: req.user.id,
      agent: agentId,
      offerPrice: offerPrice || property.price,
      message,
      contactPhone: contactPhone || req.user.phone,
    });

    const populated = await purchase.populate([
      { path: 'property', select: 'title price location images' },
      { path: 'buyer', select: 'name email phone' },
    ]);

    res.status(201).json({ success: true, message: 'Your offer was submitted to the agent.', data: populated });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/mine ────────────────────────────────────────────
// ─── @access Private (buyer) — requests I've sent
exports.getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user.id })
      .populate('property', 'title price status images location')
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    console.error('Get my purchases error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/received ────────────────────────────────────────
// ─── @access Private (agent/admin) — requests on my listings
exports.getReceivedPurchases = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { agent: req.user.id };
    const purchases = await Purchase.find(query)
      .populate('property', 'title price status images location')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    console.error('Get received purchases error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PATCH /api/purchases/:id/status ────────────────────────────────────
// ─── @access Private (agent-owner or admin)
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be: accepted, rejected, or cancelled.' });
    }

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    const isAgentOwner = purchase.agent.toString() === req.user.id;
    const isBuyerCancelling = purchase.buyer.toString() === req.user.id && status === 'cancelled';

    if (!isAgentOwner && req.user.role !== 'admin' && !isBuyerCancelling) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
    }

    purchase.status = status;
    await purchase.save();

    // If accepted, mark the property as sold/rented
    if (status === 'accepted') {
      const property = await Property.findById(purchase.property);
      if (property) {
        property.status = property.type === 'rent' ? 'rented' : 'sold';
        await property.save();
      }
    }

    const populated = await purchase.populate([
      { path: 'property', select: 'title price status' },
      { path: 'buyer', select: 'name email phone' },
      { path: 'agent', select: 'name email phone' },
    ]);

    res.status(200).json({ 
      success: true, 
      message: `Purchase request ${status}`, 
      data: populated 
    });
  } catch (error) {
    console.error('Update purchase status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/stats ──────────────────────────────────────────
// ─── @access Private (agent/admin)
exports.getPurchaseStats = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { agent: req.user.id };
    
    const [total, pending, accepted, rejected, cancelled] = await Promise.all([
      Purchase.countDocuments(query),
      Purchase.countDocuments({ ...query, status: 'pending' }),
      Purchase.countDocuments({ ...query, status: 'accepted' }),
      Purchase.countDocuments({ ...query, status: 'rejected' }),
      Purchase.countDocuments({ ...query, status: 'cancelled' }),
    ]);

    // Get total offer amounts
    const offers = await Purchase.aggregate([
      { $match: query },
      { $group: { 
        _id: null, 
        totalAmount: { $sum: '$offerPrice' },
        avgAmount: { $avg: '$offerPrice' },
        minAmount: { $min: '$offerPrice' },
        maxAmount: { $max: '$offerPrice' }
      }}
    ]);

    // Get recent purchases
    const recent = await Purchase.find(query)
      .populate('property', 'title price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          accepted,
          rejected,
          cancelled,
          conversionRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : 0,
        },
        amounts: offers[0] || { totalAmount: 0, avgAmount: 0, minAmount: 0, maxAmount: 0 },
        recent,
      }
    });
  } catch (error) {
    console.error('Get purchase stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/:id ────────────────────────────────────────────
// ─── @access Private (buyer/agent/admin)
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('property', 'title price description location images status type')
      .populate('buyer', 'name email phone avatar')
      .populate('agent', 'name email phone avatar');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found.' });
    }

    // Check authorization
    const isBuyer = purchase.buyer._id.toString() === req.user.id;
    const isAgent = purchase.agent._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this purchase.' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases ────────────────────────────────────────────────
// ─── @access Private (admin only)
exports.getAllPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('property', 'title price images location')
        .populate('buyer', 'name email phone')
        .populate('agent', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Purchase.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: purchases.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: purchases,
    });
  } catch (error) {
    console.error('Get all purchases error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};