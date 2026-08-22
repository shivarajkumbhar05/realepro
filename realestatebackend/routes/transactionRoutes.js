const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFromPurchase,
  listTransactions,
  getTransaction,
  updateStatus,
} = require('../controllers/transactionController');

router.use(protect);
router.get('/', listTransactions);
router.post('/from-purchase/:purchaseId', createFromPurchase);
router.get('/:id', getTransaction);
router.patch('/:id/status', updateStatus);

module.exports = router;