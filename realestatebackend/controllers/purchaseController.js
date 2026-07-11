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
      offerPrice,
      message,
      contactPhone,
    });

    const populated = await purchase.populate([
      { path: 'property', select: 'title price location images' },
      { path: 'buyer', select: 'name email phone' },
    ]);

    res.status(201).json({ success: true, message: 'Your offer was submitted to the agent.', data: populated });
  } catch (error) {
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PATCH /api/purchases/:id/status ────────────────────────────────────
// ─── @access Private (agent-owner or admin)
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Request not found.' });

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
        property.status = property.status === 'rent' ? 'rented' : 'sold';
        await property.save();
      }
    }

    res.status(200).json({ success: true, message: `Request ${status}`, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
