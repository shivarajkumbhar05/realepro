import api from './axios';

export const getTransactions = () => api.get('/transactions');
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const createTransactionFromPurchase = (purchaseId) => api.post(`/transactions/from-purchase/${purchaseId}`);
export const updateTransactionStatus = (id, status, note) => api.patch(`/transactions/${id}/status`, { status, note });
