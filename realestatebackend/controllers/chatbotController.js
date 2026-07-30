// ─── @route  POST /api/chatbot/chat ─────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, role = 'buyer' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const lowerMessage = message.toLowerCase();
    const roleLabel = role === 'admin' ? 'admin' : role === 'agent' ? 'agent' : 'buyer';

    let reply = 'Thanks for reaching out. I can help with listings, approvals, documents, and property guidance.';
    let suggestions = [];

    if (lowerMessage.includes('approve') || lowerMessage.includes('pending')) {
      reply = 'For admin review, open the pending approvals queue, review the listing details, and approve or reject the property before it goes live.';
      suggestions = ['Review pending listings', 'Check user management', 'See approval workflow'];
    } else if (lowerMessage.includes('document') || lowerMessage.includes('verify')) {
      reply = 'Document verification helps confirm title deeds, NOC files, and plans before a listing is approved.';
      suggestions = ['View verification checklist', 'Inspect uploaded documents', 'Learn about admin review'];
    } else if (lowerMessage.includes('property') || lowerMessage.includes('listing')) {
      reply = 'You can browse approved listings, add a new property, or review pending submissions depending on your role.';
      suggestions = ['Show me available listings', 'How do I add a property?', 'How does approval work?'];
    } else if (lowerMessage.includes('price') || lowerMessage.includes('budget')) {
      reply = 'Pricing depends on location, size, property type, and market demand. Filters can help narrow results quickly.';
      suggestions = ['Browse budget-friendly homes', 'Compare popular areas', 'Find premium listings'];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      reply = 'You can contact the support team through the contact page or continue using this assistant for quick guidance.';
      suggestions = ['Open contact page', 'View FAQ', 'Talk to support'];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      reply = `Hello! I can help you with property search, listings, documents, and ${roleLabel === 'admin' ? 'admin approval workflows' : 'next-step guidance'}.`;
      suggestions = ['Show me available listings', roleLabel === 'admin' ? 'Review pending approvals' : 'How do I get started'];
    }

    res.status(200).json({
      success: true,
      data: {
        text: reply,
        message: reply,
        role: roleLabel,
        suggestions,
        properties: [],
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── @route  GET /api/chatbot/history ────────────────────────────────────────
exports.getChatHistory = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ─── @route  DELETE /api/chatbot/clear ──────────────────────────────────────
exports.clearChat = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ─── @route  GET /api/chatbot/suggestions ────────────────────────────────────
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      'Show me available properties',
      'What is the price range?',
      'How can I contact an agent?',
      'Tell me about the location'
    ];
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};