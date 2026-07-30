const express = require('express');
const router = express.Router();
const {
  chat,
  getChatHistory,
  clearChat,
  getSuggestions,
} = require('../controllers/chatbotController');

// Public routes
router.post('/chat', chat);
router.post('/message', chat);
router.get('/suggestions', getSuggestions);

// Protected routes
router.get('/history', getChatHistory);
router.delete('/clear', clearChat);

module.exports = router; // ✅ Make sure this is here