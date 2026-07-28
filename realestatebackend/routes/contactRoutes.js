const express = require('express');
const router = express.Router();
const {
  sendContactMessage,
  getContactMessages,
  getContactMessage,
  replyToContact,
  deleteContactMessage,
  markAsRead,
  updateContactStatus,
  getContactStats,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// ─── Public Route ────────────────────────────────────────────────────────────
// @route  POST /api/contact
router.post('/', sendContactMessage);

// ─── Protected Admin Routes ──────────────────────────────────────────────────
// All routes below this require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route  GET /api/contact/stats
router.get('/stats', getContactStats);

// @route  GET /api/contact
router.get('/', getContactMessages);

// @route  GET /api/contact/:id
router.get('/:id', getContactMessage);

// @route  PUT /api/contact/:id/read
router.put('/:id/read', markAsRead);

// @route  PUT /api/contact/:id/status
router.put('/:id/status', updateContactStatus);

// @route  POST /api/contact/:id/reply
router.post('/:id/reply', replyToContact);

// @route  DELETE /api/contact/:id
router.delete('/:id', deleteContactMessage);

module.exports = router;