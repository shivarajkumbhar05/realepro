const express = require('express');
const router = express.Router();
const {
  getPropertyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/property/:propertyId', getPropertyReviews);
router.post('/property/:propertyId', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
