const User = require('../models/User');
const Property = require('../models/Property');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');

// ─── @route  GET /api/admin/dashboard ────────────────────────────────────────
// ─── @access Private (admin only)
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      pendingApprovals,
      totalAgents,
      totalBuyers,
      propertiesByType,
      propertiesByStatus,
      recentProperties,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isApproved: false, isActive: true }),
      User.countDocuments({ role: 'agent', isActive: true }),
      User.countDocuments({ role: 'buyer', isActive: true }),
      Property.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Property.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('agent', 'name email'),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('-password'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProperties,
          pendingApprovals,
          totalAgents,
          totalBuyers,
        },
        propertiesByType,
        propertiesByStatus,
        recentProperties,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/admin/users ────────────────────────────────────────────
// ─── @access Private (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/admin/users/:id ────────────────────────────────────────
// ─── @access Private (admin only) — Full 360 profile of a user/agent/buyer
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const [listedProperties, purchasesMade, purchasesReceived, reviewsWritten] = await Promise.all([
      Property.find({ agent: user._id })
        .select('title price status type isApproved isActive location createdAt images avgRating numReviews')
        .sort({ createdAt: -1 }),
      Purchase.find({ buyer: user._id })
        .populate('property', 'title price location')
        .populate('agent', 'name email')
        .sort({ createdAt: -1 }),
      Purchase.find({ agent: user._id })
        .populate('property', 'title price')
        .populate('buyer', 'name email phone')
        .sort({ createdAt: -1 }),
      Review.find({ user: user._id })
        .populate('property', 'title')
        .sort({ createdAt: -1 }),
    ]);

    const approvedCount = listedProperties.filter((p) => p.isApproved).length;
    const pendingCount = listedProperties.filter((p) => !p.isApproved).length;

    res.status(200).json({
      success: true,
      data: {
        user,
        summary: {
          totalListings: listedProperties.length,
          approvedListings: approvedCount,
          pendingListings: pendingCount,
          totalPurchasesMade: purchasesMade.length,
          totalOffersReceived: purchasesReceived.length,
          totalReviews: reviewsWritten.length,
        },
        listedProperties,
        purchasesMade,
        purchasesReceived,
        reviewsWritten,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PUT /api/admin/users/:id ────────────────────────────────────────
// ─── @access Private (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  DELETE /api/admin/users/:id ─────────────────────────────────────
// ─── @access Private (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/admin/pending-properties ───────────────────────────────
// ─── @access Private (admin only)
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: false, isActive: true })
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/admin/users ────────────────────────────────────────────
// ─── @access Private (admin only) — Create any role including admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role, phone });
    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, message: 'User created', data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
