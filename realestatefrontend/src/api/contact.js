// src/api/contact.js
import api from './axios';

export const sendContactMessage = async (data) => {
  try {
    console.log('📤 Sending contact message:', data);
    const response = await api.post('/contact', data);
    console.log('📥 Contact response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Contact API error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

export default {
  sendContactMessage,
};