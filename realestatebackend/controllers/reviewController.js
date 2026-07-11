const Review = require('../models/Review');
const Property = require('../models/Property');

// ─── @route  GET /api/reviews/property/:propertyId ───────────────────────────
// ─── @access Private (all roles)
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const property = await Property.findById(req.params.propertyId).select('avgRating numReviews');

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: property?.avgRating || 0,
      numReviews: property?.numReviews || 0,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/reviews/property/:propertyId ───────────────────────────
// ─── @access Private (all roles)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const existing = await Review.findOne({ property: propertyId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property. Edit your existing review instead.' });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user.id,
      rating,
      comment,
    });

    await Review.recalculateForProperty(propertyId);

    const populated = await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Review submitted', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PUT /api/reviews/:id ──────────────────────────────────────────────
// ─── @access Private (review owner)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review.' });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    await Review.recalculateForProperty(review.property);

    res.status(200).json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  DELETE /api/reviews/:id ────────────────────────────────────────────
// ─── @access Private (review owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    const propertyId = review.property;
    await review.deleteOne();
    await Review.recalculateForProperty(propertyId);

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
