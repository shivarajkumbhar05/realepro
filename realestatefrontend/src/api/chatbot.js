import api from './axios';

export const sendChatMessage = (message) => api.post('/chatbot/message', { message });
