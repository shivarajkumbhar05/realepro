// controllers/chatbotController.js
// (No express, no router here — just handler functions)

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // TODO: replace with your actual chatbot logic (OpenAI call, etc.)
        const reply = `You said: "${message}"`; // placeholder

        res.json({ success: true, data: { reply } });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendMessage };