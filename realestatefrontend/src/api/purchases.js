import api from './axios';

export const createPurchase = (propertyId, data) => api.post(`/purchases/property/${propertyId}`, data);
export const getMyPurchases = () => api.get('/purchases/mine');
export const getReceivedPurchases = () => api.get('/purchases/received');
export const updatePurchaseStatus = (id, status) => api.patch(`/purchases/${id}/status`, { status });
