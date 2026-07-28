// ─── @route  POST /api/chatbot/chat ─────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const responses = {
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! Welcome to our real estate platform.',
      'properties': 'You can browse our properties on the properties page.',
      'price': 'Our properties range from $100,000 to $5,000,000+.',
      'contact': 'You can contact us through the contact form.',
      'default': 'Thank you for your message. Our team will get back to you soon.'
    };
    
    const lowerMessage = message.toLowerCase();
    let reply = responses.default;
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        reply = value;
        break;
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        message: reply,
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