const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getMyPurchases,
  getReceivedPurchases,
  updatePurchaseStatus,
} = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/property/:propertyId', authorize('buyer', 'agent', 'admin'), createPurchase);
router.get('/mine', getMyPurchases);
router.get('/received', authorize('agent', 'admin'), getReceivedPurchases);
router.patch('/:id/status', updatePurchaseStatus);

module.exports = router;
