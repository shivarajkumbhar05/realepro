// E:/realepro-main/realestatebackend/controllers/PropertyController.js
const mongoose = require('mongoose');
const Property = require('../models/Property');

// ✅ Fix: Check if User model already exists before requiring
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = require('../models/User');
}

// ================================================================
// 📦 CRUD OPERATIONS
// ================================================================

// ─── GET PUBLIC STATS ──────────────────────────────────────────────────
const getPublicStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ isApproved: true });
    const cities = await Property.distinct('location.city', { isApproved: true });
    
    let totalAgents = 0;
    try {
      totalAgents = await User.countDocuments({ role: 'agent', isActive: true });
    } catch (err) {
      console.warn('Could not count agents:', err.message);
    }
    
    const avgRatingResult = await Property.aggregate([
      { $match: { isApproved: true, numReviews: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$avgRating' } } }
    ]);
    const avgRating = avgRatingResult[0]?.avg || 0;

    res.json({
      success: true,
      data: {
        totalProperties: totalProperties || 0,
        totalCities: cities?.length || 0,
        totalAgents: totalAgents || 0,
        avgRating: parseFloat(avgRating.toFixed(1)) || 0,
      }
    });
  } catch (error) {
    console.error('Error in getPublicStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL PROPERTIES ────────────────────────────────────────────────
const getProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', city, type, status, minPrice, maxPrice, search } = req.query;
    
    const query = { isApproved: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (type) query.propertyType = type;
    if (status) query.status = status;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const properties = await Property.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('agent', 'name email phone profileImage');

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE PROPERTY ──────────────────────────────────────────────
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'name email phone profileImage')
      .populate('reviews.user', 'name profileImage');
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.views = (property.views || 0) + 1;
    await property.save();

    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error in getProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE PROPERTY ──────────────────────────────────────────────────
const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      agent: req.user._id,
      isApproved: req.user.role === 'admin' ? true : false,
    };
    
    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PROPERTY ──────────────────────────────────────────────────
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated, message: 'Property updated successfully' });
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE PROPERTY ──────────────────────────────────────────────────
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SEARCH PROPERTIES ─────────────────────────────────────────────────
const searchProperties = async (req, res) => {
  try {
    const { q, city, minPrice, maxPrice, propertyType, status } = req.query;
    
    const query = { isApproved: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
      ];
    }

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (status) query.status = status;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('agent', 'name email phone')
      .limit(50)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: properties, count: properties.length });
  } catch (error) {
    console.error('Error in searchProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET PROPERTIES BY AGENT ──────────────────────────────────────────
const getPropertiesByAgent = async (req, res) => {
  try {
    const properties = await Property.find({ 
      agent: req.params.agentId,
      isApproved: true 
    }).populate('agent', 'name email phone');

    res.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error in getPropertiesByAgent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SIMILAR PROPERTIES ───────────────────────────────────────────
const getSimilarProperties = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const similar = await Property.find({
      _id: { $ne: property._id },
      isApproved: true,
      propertyType: property.propertyType,
      'location.city': property.location.city,
    })
    .limit(parseInt(req.query.limit) || 4)
    .populate('agent', 'name email phone');

    res.json({ success: true, data: similar });
  } catch (error) {
    console.error('Error in getSimilarProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// ❤️ FAVORITES
// ================================================================

const getFavoriteProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'agent', select: 'name email phone' }
    });
    res.json({ success: true, data: user?.favorites || [] });
  } catch (error) {
    console.error('Error in getFavoriteProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const index = user.favorites.indexOf(propertyId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    res.json({
      success: true,
      data: user.favorites,
      message: index > -1 ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const isFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;
    const isFav = user.favorites.includes(propertyId);
    res.json({ success: true, data: { isFavorite: isFav } });
  } catch (error) {
    console.error('Error in isFavorite:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// ⭐ REVIEWS
// ================================================================

const getPropertyReviews = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .select('reviews')
      .populate('reviews.user', 'name profileImage');
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    res.json({ success: true, data: property.reviews || [] });
  } catch (error) {
    console.error('Error in getPropertyReviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existingReview = property.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this property' 
      });
    }

    const review = {
      user: req.user._id,
      userName: req.user.name,
      rating: parseInt(rating),
      comment,
      date: new Date()
    };

    property.reviews.push(review);
    property.numReviews = property.reviews.length;
    property.avgRating = property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length;

    await property.save();

    res.status(201).json({ 
      success: true, 
      data: property.reviews, 
      message: 'Review added successfully' 
    });
  } catch (error) {
    console.error('Error in addPropertyReview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const reviewIndex = property.reviews.findIndex(
      review => review._id.toString() === req.params.reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = property.reviews[reviewIndex];
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    property.reviews.splice(reviewIndex, 1);
    property.numReviews = property.reviews.length;
    property.avgRating = property.reviews.length > 0 
      ? property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length 
      : 0;

    await property.save();

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 🛡️ ADMIN FUNCTIONS
// ================================================================

const getAdminStats = async (req, res) => {
  try {
    const [total, pending, approved, totalAgents, totalBuyers] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ isApproved: false }),
      Property.countDocuments({ isApproved: true }),
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ role: 'buyer' }),
    ]);

    res.json({
      success: true,
      data: { total, pending, approved, totalAgents, totalBuyers }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', search } = req.query;
    
    const query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const properties = await Property.find(query)
      .populate('agent', 'name email phone')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAdminProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: false })
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error in getPendingProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, approvedAt: new Date(), rejectionReason: null },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, data: property, message: 'Property approved successfully' });
  } catch (error) {
    console.error('Error in approveProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: reason || 'No reason provided', approvedAt: null },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, data: property, message: 'Property rejected' });
  } catch (error) {
    console.error('Error in rejectProperty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkApproveProperties = async (req, res) => {
  try {
    const { propertyIds } = req.body;
    const result = await Property.updateMany(
      { _id: { $in: propertyIds } },
      { isApproved: true, approvedAt: new Date(), rejectionReason: null }
    );
    res.json({ 
      success: true, 
      data: result,
      message: `${result.modifiedCount} properties approved successfully` 
    });
  } catch (error) {
    console.error('Error in bulkApproveProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkRejectProperties = async (req, res) => {
  try {
    const { propertyIds, reason } = req.body;
    const result = await Property.updateMany(
      { _id: { $in: propertyIds } },
      { isApproved: false, rejectionReason: reason || 'Bulk rejection', approvedAt: null }
    );
    res.json({ 
      success: true, 
      data: result,
      message: `${result.modifiedCount} properties rejected successfully` 
    });
  } catch (error) {
    console.error('Error in bulkRejectProperties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 📸 IMAGE FUNCTIONS
// ================================================================

const uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const images = (req.files || []).map((file, index) => ({
      path: file.path || file.location,
      filename: file.filename || file.key,
      isPrimary: property.images.length === 0 && index === 0,
      caption: '',
    }));

    property.images.push(...images);
    await property.save();

    res.status(201).json({
      success: true,
      data: property.images,
      message: `${images.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error in uploadImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateImageDetails = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { caption, isPrimary } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const image = property.images.id(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    if (caption !== undefined) image.caption = caption;
    if (isPrimary !== undefined) {
      if (isPrimary) {
        property.images.forEach(img => img.isPrimary = false);
      }
      image.isPrimary = isPrimary;
    }

    await property.save();

    res.json({ success: true, data: property.images, message: 'Image updated successfully' });
  } catch (error) {
    console.error('Error in updateImageDetails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const image = property.images.id(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const wasPrimary = image.isPrimary;
    property.images.pull(imageId);
    await property.save();

    if (wasPrimary && property.images.length > 0) {
      property.images[0].isPrimary = true;
      await property.save();
    }

    res.json({ success: true, data: property.images, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const image = property.images.id(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    property.images.forEach(img => img.isPrimary = false);
    image.isPrimary = true;
    await property.save();

    res.json({ success: true, data: property.images, message: 'Primary image set successfully' });
  } catch (error) {
    console.error('Error in setPrimaryImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const images = [];
    for (const imageId of imageOrder) {
      const image = property.images.id(imageId);
      if (image) images.push(image);
    }

    property.images = images;
    await property.save();

    res.json({ success: true, data: property.images, message: 'Images reordered successfully' });
  } catch (error) {
    console.error('Error in reorderImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 📄 DOCUMENT FUNCTIONS
// ================================================================

const uploadDocuments = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const documents = (req.files || []).map(file => ({
      name: file.originalname || file.filename,
      path: file.path || file.location,
      filename: file.filename || file.key,
      uploadedAt: new Date(),
      verified: false,
    }));

    property.documents = [...(property.documents || []), ...documents];
    await property.save();

    res.status(201).json({
      success: true,
      data: property.documents,
      message: `${documents.length} documents uploaded successfully`
    });
  } catch (error) {
    console.error('Error in uploadDocuments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPropertyDocuments = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property.documents || [] });
  } catch (error) {
    console.error('Error in getPropertyDocuments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    property.documents = property.documents.filter(doc => doc._id.toString() !== docId);
    await property.save();

    res.json({ success: true, data: property.documents, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can verify documents' });
    }

    property.documents = documents || [];
    property.documentsVerified = true;
    property.documentsVerifiedAt = new Date();
    await property.save();

    res.json({ success: true, data: property.documents, message: 'Documents verified successfully' });
  } catch (error) {
    console.error('Error in verifyDocuments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { status, notes } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can verify documents' });
    }

    const doc = property.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.verified = status === 'verified';
    doc.verificationNotes = notes || '';
    doc.verifiedAt = new Date();
    await property.save();

    res.json({ success: true, data: property.documents, message: 'Document verified successfully' });
  } catch (error) {
    console.error('Error in verifyDocument:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDocumentVerificationStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const status = {
      verified: property.documentsVerified || false,
      verifiedAt: property.documentsVerifiedAt || null,
      documents: property.documents?.map(doc => ({
        id: doc._id,
        name: doc.name,
        verified: doc.verified || false,
        verifiedAt: doc.verifiedAt || null,
      })) || [],
    };

    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Error in getDocumentVerificationStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestDocumentVerification = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.verificationRequested = true;
    property.verificationRequestedAt = new Date();
    await property.save();

    res.json({ success: true, message: 'Document verification requested successfully' });
  } catch (error) {
    console.error('Error in requestDocumentVerification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 🤖 AI VERIFICATION
// ================================================================

const aiVerifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const doc = property.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Simulate AI verification
    const aiScore = Math.floor(Math.random() * 30) + 70;
    const isVerified = aiScore > 80;

    doc.aiVerified = true;
    doc.aiScore = aiScore;
    doc.verified = isVerified;
    doc.verifiedAt = new Date();
    await property.save();

    res.json({
      success: true,
      data: {
        documentId: docId,
        aiScore,
        verified: isVerified,
        message: isVerified ? 'Document verified by AI' : 'Document needs manual review',
      }
    });
  } catch (error) {
    console.error('Error in aiVerifyDocument:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkVerifyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentIds } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can verify documents' });
    }

    const results = [];
    for (const docId of documentIds) {
      const doc = property.documents.id(docId);
      if (doc) {
        doc.verified = true;
        doc.verifiedAt = new Date();
        results.push({ id: docId, success: true });
      } else {
        results.push({ id: docId, success: false, error: 'Document not found' });
      }
    }

    const allVerified = property.documents.every(doc => doc.verified);
    if (allVerified && property.documents.length > 0) {
      property.documentsVerified = true;
      property.documentsVerifiedAt = new Date();
    }

    await property.save();

    res.json({
      success: true,
      data: results,
      message: `Bulk verification completed: ${results.filter(r => r.success).length} verified`
    });
  } catch (error) {
    console.error('Error in bulkVerifyDocuments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 📊 ADDITIONAL ANALYTICS
// ================================================================

const getPropertyStatsByCity = async (req, res) => {
  try {
    const stats = await Property.aggregate([
      { $match: { isApproved: true } },
      { $group: {
        _id: '$location.city',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }},
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getPropertyStatsByCity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPropertyPriceRange = async (req, res) => {
  try {
    const stats = await Property.aggregate([
      { $match: { isApproved: true } },
      { $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
      }}
    ]);
    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    console.error('Error in getPropertyPriceRange:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentlyViewed = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: true })
      .sort({ views: -1 })
      .limit(10)
      .populate('agent', 'name email phone');
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error in getRecentlyViewed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPropertyInsights = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const similarInCity = await Property.countDocuments({
      _id: { $ne: req.params.id },
      isApproved: true,
      'location.city': property.location.city,
      propertyType: property.propertyType,
    });

    const avgPriceInCity = await Property.aggregate([
      { $match: { 
        isApproved: true,
        'location.city': property.location.city,
        propertyType: property.propertyType,
      }},
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.json({ 
      success: true, 
      data: {
        views: property.views || 0,
        daysOnMarket: Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        similarPropertiesInCity: similarInCity,
        averagePriceInCity: avgPriceInCity[0]?.avgPrice || 0,
        priceComparison: property.price - (avgPriceInCity[0]?.avgPrice || 0),
      }
    });
  } catch (error) {
    console.error('Error in getPropertyInsights:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// 📤 EXPORT ALL FUNCTIONS
// ================================================================

module.exports = {
  // CRUD
  getPublicStats,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  
  // Search & Filter
  searchProperties,
  getPropertiesByAgent,
  getSimilarProperties,
  
  // Favorites
  getFavoriteProperties,
  toggleFavorite,
  isFavorite,
  
  // Reviews
  getPropertyReviews,
  addPropertyReview,
  deleteReview,
  
  // Admin
  getAdminStats,
  getAdminProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  bulkApproveProperties,
  bulkRejectProperties,
  
  // Images
  uploadImages,
  updateImageDetails,
  deleteImage,
  setPrimaryImage,
  reorderImages,
  
  // Documents
  uploadDocuments,
  getPropertyDocuments,
  deleteDocument,
  verifyDocuments,
  verifyDocument,
  getDocumentVerificationStatus,
  requestDocumentVerification,
  
  // AI Verification
  aiVerifyDocument,
  bulkVerifyDocuments,
  
  // Analytics
  getPropertyStatsByCity,
  getPropertyPriceRange,
  getRecentlyViewed,
  getPropertyInsights,
};