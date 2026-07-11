import api from './axios';

export const getPropertyReviews = (propertyId) => api.get(`/reviews/property/${propertyId}`);
export const createReview = (propertyId, data) => api.post(`/reviews/property/${propertyId}`, data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
