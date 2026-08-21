const Review = require('../models/Review');
const Property = require('../models/Property');

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('property', 'title')
      .populate('user', 'name avatar');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('property', 'title')
      .populate('user', 'name avatar');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.property = req.body.propertyId;
    
    const review = await Review.create(req.body);
    
    // Update property rating
    const property = await Property.findById(req.body.propertyId);
    const reviews = await Review.find({ property: req.body.propertyId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    property.avgRating = avgRating;
    property.numReviews = reviews.length;
    await property.save();
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this review.' });
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();
    await Review.recalculateForProperty(review.property);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this review.' });
    }
    await review.deleteOne();
    await Review.recalculateForProperty(review.property);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('property', 'title images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};