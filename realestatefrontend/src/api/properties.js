// src/api/properties.js
import api from './axios'; // Use the pre-configured axios instance

// ─── Get all properties with filters ──────────────────────────────────
export const getProperties = async (params = {}) => {
  try {
    const response = await api.get('/properties', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// ─── Get a single property by ID ──────────────────────────────────────
// Both function names work - use whichever you prefer
export const getProperty = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

// ─── Alias for getProperty (same function) ───────────────────────────
export const getPropertyById = async (id) => {
  return getProperty(id);
};

// ─── Get public stats (for homepage) ──────────────────────────────────
export const getPublicStats = async () => {
  try {
    const response = await api.get('/properties/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// ─── Create a new property (agent/admin) ─────────────────────────────
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// ─── Update a property (agent/admin) ──────────────────────────────────
export const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// ─── Delete a property (agent/admin) ──────────────────────────────────
export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// ─── Get properties by agent ID ───────────────────────────────────────
export const getPropertiesByAgent = async (agentId, params = {}) => {
  try {
    const response = await api.get(`/properties/agent/${agentId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    throw error;
  }
};

// ─── Get favorite properties ──────────────────────────────────────────
export const getFavoriteProperties = async () => {
  try {
    const response = await api.get('/properties/favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// ─── Toggle favorite status ───────────────────────────────────────────
export const toggleFavorite = async (propertyId) => {
  try {
    const response = await api.post(`/properties/${propertyId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// ─── Get property reviews ─────────────────────────────────────────────
export const getPropertyReviews = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// ─── Add review to property ───────────────────────────────────────────
export const addPropertyReview = async (propertyId, reviewData) => {
  try {
    const response = await api.post(`/properties/${propertyId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// ─── Get similar properties ───────────────────────────────────────────
export const getSimilarProperties = async (propertyId, limit = 4) => {
  try {
    const response = await api.get(`/properties/${propertyId}/similar`, { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    throw error;
  }
};

// ─── Search properties ─────────────────────────────────────────────────
export const searchProperties = async (searchParams) => {
  try {
    const response = await api.get('/properties/search', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

// ─── Get property statistics for admin dashboard ──────────────────────
export const getAdminStats = async () => {
  try {
    const response = await api.get('/properties/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// ─── Get properties for admin (with filters) ──────────────────────────
export const getAdminProperties = async (params = {}) => {
  try {
    const response = await api.get('/properties/admin/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    throw error;
  }
};

// ─── Approve property (admin) ─────────────────────────────────────────
export const approveProperty = async (propertyId) => {
  try {
    const response = await api.put(`/properties/admin/${propertyId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving property:', error);
    throw error;
  }
};

// ─── Reject property (admin) ──────────────────────────────────────────
export const rejectProperty = async (propertyId, reason) => {
  try {
    const response = await api.put(`/properties/admin/${propertyId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting property:', error);
    throw error;
  }
};

// ─── Get pending properties for admin ─────────────────────────────────
export const getPendingProperties = async () => {
  try {
    const response = await api.get('/properties/admin/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    throw error;
  }
};

// ─── Update image details ──────────────────────────────────────────────
export const updateImageDetails = async (propertyId, imageId, imageData) => {
  try {
    const response = await api.put(`/properties/${propertyId}/images/${imageId}`, imageData);
    return response.data;
  } catch (error) {
    console.error('Error updating image details:', error);
    throw error;
  }
};

// ─── Delete an image from property ─────────────────────────────────
export const deleteImage = async (propertyId, imageId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// ─── Upload images to property ──────────────────────────────────────
export const uploadImages = async (propertyId, formData) => {
  try {
    const response = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// ─── Set primary image ──────────────────────────────────────────────
export const setPrimaryImage = async (propertyId, imageId) => {
  try {
    const response = await api.put(`/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  } catch (error) {
    console.error('Error setting primary image:', error);
    throw error;
  }
};

// ─── Verify documents for a property ──────────────────────────────────
export const verifyDocuments = async (propertyId, documentData) => {
  try {
    const response = await api.post(`/properties/${propertyId}/documents/verify`, documentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying documents:', error);
    throw error;
  }
};

// ─── Upload documents for a property ──────────────────────────────────
export const uploadDocuments = async (propertyId, formData) => {
  try {
    const response = await api.post(`/properties/${propertyId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
};

// ─── Get documents for a property ─────────────────────────────────────
export const getPropertyDocuments = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/documents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

// ─── Delete a document ─────────────────────────────────────────────────
export const deleteDocument = async (propertyId, documentId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// ─── Get document verification status ─────────────────────────────────
export const getDocumentVerificationStatus = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/documents/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document status:', error);
    throw error;
  }
};

// ─── AI Document Verification ─────────────────────────────────────────
export const aiVerifyDocument = async (propertyId, documentId) => {
  try {
    const response = await api.post(`/properties/${propertyId}/documents/${documentId}/ai-verify`);
    return response.data;
  } catch (error) {
    console.error('Error with AI document verification:', error);
    throw error;
  }
};

// Export default for convenience
export default {
  getProperties,
  getProperty,        // ✅ Added
  getPropertyById,
  getPublicStats,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByAgent,
  getFavoriteProperties,
  toggleFavorite,
  getPropertyReviews,
  addPropertyReview,
  getSimilarProperties,
  searchProperties,
  getAdminStats,
  getAdminProperties,
  approveProperty,
  rejectProperty,
  getPendingProperties,
  updateImageDetails,
  deleteImage,
  uploadImages,
  setPrimaryImage,
  verifyDocuments,
  uploadDocuments,
  getPropertyDocuments,
  deleteDocument,
  getDocumentVerificationStatus,
  aiVerifyDocument,
};