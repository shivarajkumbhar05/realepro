const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPurchase,
  getMyPurchases,
  getReceivedPurchases,
  updatePurchaseStatus,
  getPurchaseStats,
  getPurchase,
  getAllPurchases,
} = require('../controllers/purchaseController');

// All purchase routes require authentication
router.use(protect);

// Buyer routes
router.post('/property/:propertyId', authorize('buyer'), createPurchase);
router.get('/mine', getMyPurchases);

// Agent/Admin routes
router.get('/received', getReceivedPurchases);
router.get('/stats', getPurchaseStats);

// Admin only
router.get('/all', authorize('admin'), getAllPurchases);

// Common routes
router.get('/:id', getPurchase);
router.patch('/:id/status', updatePurchaseStatus);

module.exports = router;