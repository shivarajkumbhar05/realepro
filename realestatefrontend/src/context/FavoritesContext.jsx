import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || ' https://realepro.onrender.com/api';

  const getHeaders = () => {
    const token = localStorage.getItem('re_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Load favorites from API when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('re_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/properties/favorites`, getHeaders());
      setFavorites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav._id === propertyId);
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const token = localStorage.getItem('re_token');
      if (!token) {
        alert('Please login to save favorites');
        return;
      }

      const response = await axios.post(
        `${API_URL}/properties/${propertyId}/favorite`,
        {},
        getHeaders()
      );

      // Re-sync from server response (or just refetch)
      setFavorites(response.data.data); // adjust based on what your API actually returns
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  const removeFavorite = async (propertyId) => {
    try {
      // Your backend has no dedicated "remove" route — toggle achieves the same result
      const response = await axios.post(
        `${API_URL}/properties/${propertyId}/favorite`,
        {},
        getHeaders()
      );
      setFavorites(response.data.data);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      fetchFavorites,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};












