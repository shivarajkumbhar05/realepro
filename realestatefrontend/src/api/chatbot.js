import api from './axios';

export const sendChatMessage = (message, role = 'buyer') =>
  api.post('/chatbot/chat', { message, role });
