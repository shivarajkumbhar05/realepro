const Purchase = require('../models/Purchase');
const Property = require('../models/Property');
const User = require('../models/User');
const { transporter } = require('../config/mailer');

// ─── @route  POST /api/purchases/property/:propertyId ─────────────────────────
// ─── @access Private (buyer)
exports.createPurchase = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { offerPrice, message, contactPhone } = req.body;

    // Validate offer price
    if (offerPrice !== undefined && offerPrice !== null) {
      const price = Number(offerPrice);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Offer price must be a valid positive number.',
        });
      }
    }

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

    // Check for duplicate pending offer (prevent spam)
    const existingOffer = await Purchase.findOne({
      property: propertyId,
      buyer: req.user.id,
      status: 'pending',
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending offer on this property. Wait for the agent response or cancel it first.',
      });
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

    // Send email notification to agent (don't block if email fails)
    try {
      const agent = await User.findById(agentId).select('email name');
      if (agent?.email) {
        const offerAmount = offerPrice || property.price;
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: agent.email,
          subject: `🎯 New Offer for "${property.title}" on PropEstate`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Purchase Offer Received! 🎉</h2>
              <p>Hello <strong>${agent.name}</strong>,</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Offer Details</h3>
                <p><strong>Property:</strong> ${property.title}</p>
                <p><strong>Location:</strong> ${property.location}</p>
                <p><strong>Offer Price:</strong> ₹${Number(offerAmount).toLocaleString('en-IN')}</p>
                <p><strong>Base Price:</strong> ₹${Number(property.price).toLocaleString('en-IN')}</p>
              </div>
              
              <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #6b21a8;">Buyer Information</h3>
                <p><strong>Name:</strong> ${populated.buyer.name}</p>
                <p><strong>Email:</strong> ${populated.buyer.email}</p>
                <p><strong>Phone:</strong> ${populated.buyer.phone}</p>
              </div>
              
              ${message ? `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e;">Buyer Message</h3>
                <p style="margin: 0;">"${message}"</p>
              </div>` : ''}
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <a href="${process.env.FRONTEND_URL || 'https://realestate.example.com'}/purchases" 
                   style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  View Offer in Dashboard
                </a>
              </p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated notification from PropEstate. Please do not reply to this email.
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.warn('Failed to send agent notification email:', emailError.message);
      // Don't fail the offer if email fails - notification is secondary
    }

    res.status(201).json({
      success: true,
      message: 'Your offer was submitted to the agent.',
      data: populated,
    });
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
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: accepted, rejected, or cancelled.',
      });
    }

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    const isAgentOwner = purchase.agent.toString() === req.user.id;
    const isBuyerCancelling = purchase.buyer.toString() === req.user.id && status === 'cancelled';

    if (!isAgentOwner && req.user.role !== 'admin' && !isBuyerCancelling) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this purchase.',
      });
    }

    purchase.status = status;
    await purchase.save();

    const populated = await purchase
      .populate('property', 'title price location')
      .populate('buyer', 'name email')
      .execPopulate();

    res.status(200).json({
      success: true,
      message: `Offer ${status} successfully.`,
      data: populated,
    });
  } catch (error) {
    console.error('Update purchase status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/stats ────────────────────────────────────────────
// ─── @access Private (agent/admin)
exports.getPurchaseStats = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { agent: req.user.id };

    const stats = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Get purchase stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/:id ────────────────────────────────────────────
// ─── @access Private
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('property', 'title price status images location')
      .populate('buyer', 'name email phone')
      .populate('agent', 'name email phone');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found.' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/purchases/all ────────────────────────────────────────────
// ─── @access Private (admin only)
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('property', 'title price status location')
      .populate('buyer', 'name email')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    console.error('Get all purchases error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
