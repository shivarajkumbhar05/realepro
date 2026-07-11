// E:/realepro-main/realestatebackend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// Import all controller functions
const {
  getPublicStats,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByAgent,
  getFavoriteProperties,
  toggleFavorite,
  isFavorite,
  getPropertyReviews,
  addPropertyReview,
  deleteReview,
  getSimilarProperties,
  searchProperties,
  getAdminStats,
  getAdminProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  bulkApproveProperties,
  bulkRejectProperties,
  uploadImages,
  updateImageDetails,
  deleteImage,
  setPrimaryImage,
  reorderImages,
  uploadDocuments,
  getPropertyDocuments,
  deleteDocument,
  verifyDocuments,
  verifyDocument,
  getDocumentVerificationStatus,
  requestDocumentVerification,
  aiVerifyDocument,
  bulkVerifyDocuments,
  getPropertyStatsByCity,
  getPropertyPriceRange,
  getRecentlyViewed,
  getPropertyInsights,
} = require('../controllers/propertyController');

// ════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES — No authentication required
// Everything in this section MUST stay above router.use(protect)
// Specific/static paths MUST come before dynamic ':id' paths
// ════════════════════════════════════════════════════════════════════

router.get('/stats', getPublicStats);
router.get('/', optionalAuth, getProperties);
router.get('/search', optionalAuth, searchProperties);

router.get('/analytics/city-stats', optionalAuth, getPropertyStatsByCity);
router.get('/analytics/price-range', optionalAuth, getPropertyPriceRange);
router.get('/analytics/recently-viewed', optionalAuth, getRecentlyViewed);

router.get('/agent/:agentId', optionalAuth, getPropertiesByAgent);

// ⚠️ MUST come before '/:id' — apply protect directly here, not via router.use()
router.get('/favorites', protect, getFavoriteProperties);

// Dynamic single-property routes — public, must stay above router.use(protect)
router.get('/:id', optionalAuth, getProperty);
router.get('/:id/similar', optionalAuth, getSimilarProperties);
router.get('/:id/reviews', optionalAuth, getPropertyReviews);
router.get('/:id/insights', optionalAuth, getPropertyInsights);

// ════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — Authentication required from this point on
// ════════════════════════════════════════════════════════════════════
router.use(protect);

// ─── Favorites ──────────────────────────────────────────────────────
router.post('/:id/favorite', toggleFavorite);
router.get('/:id/is-favorite', isFavorite);

// ─── Reviews (write actions) ──────────────────────────────────────────
router.post('/:id/reviews', addPropertyReview);
router.delete('/:id/reviews/:reviewId', deleteReview);

// ─── Property CRUD ──────────────────────────────────────────────────
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// ─── Admin Routes ──────────────────────────────────────────────────
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/admin/all', authorize('admin'), getAdminProperties);
router.get('/admin/pending', authorize('admin'), getPendingProperties);
router.put('/admin/:id/approve', authorize('admin'), approveProperty);
router.put('/admin/:id/reject', authorize('admin'), rejectProperty);
router.post('/admin/bulk-approve', authorize('admin'), bulkApproveProperties);
router.post('/admin/bulk-reject', authorize('admin'), bulkRejectProperties);

// ─── Image Routes ──────────────────────────────────────────────────
router.post('/:id/images', uploadImages);
router.put('/:id/images/:imageId', updateImageDetails);
router.delete('/:id/images/:imageId', deleteImage);
router.put('/:id/images/:imageId/primary', setPrimaryImage);
router.put('/:id/images/reorder', reorderImages);

// ─── Document Routes ───────────────────────────────────────────────
router.post('/:id/documents', uploadDocuments);
router.get('/:id/documents', getPropertyDocuments);
router.delete('/:id/documents/:docId', deleteDocument);
router.post('/:id/documents/verify', authorize('admin'), verifyDocuments);
router.put('/:id/documents/:docId/verify', authorize('admin'), verifyDocument);
router.get('/:id/documents/status', getDocumentVerificationStatus);
router.post('/:id/documents/request-verification', requestDocumentVerification);

// ─── AI Verification Routes ───────────────────────────────────────
router.post('/:id/documents/:docId/ai-verify', aiVerifyDocument);
router.post('/:id/documents/bulk-verify', authorize('admin'), bulkVerifyDocuments);

module.exports = router;
