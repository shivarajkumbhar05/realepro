const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getPropertyReviews,
  getUserReviews,
} = require('../controllers/reviewController');

// Public routes
router.get('/', getReviews);
router.get('/property/:propertyId', getPropertyReviews);
router.get('/user/me', protect, getUserReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router; // ✅ Make sure this is here