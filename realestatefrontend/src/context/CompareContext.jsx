// src/context/CompareContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext(undefined);

const STORAGE_KEY = 'compareProperties';
const MAX_COMPARE = 4; // adjust as needed

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading compare list from storage:', err);
      return [];
    }
  });

  // Persist to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (err) {
      console.error('Error saving compare list to storage:', err);
    }
  }, [compareList]);

  const isComparing = useCallback(
    (propertyId) => compareList.some((p) => p._id === propertyId),
    [compareList]
  );

  const addToCompare = useCallback(
    (property) => {
      setCompareList((prev) => {
        if (prev.some((p) => p._id === property._id)) return prev;
        if (prev.length >= MAX_COMPARE) {
          toast.error(`You can only compare up to ${MAX_COMPARE} properties`);
          return prev;
        }
        toast.success('Added to compare');
        return [...prev, property];
      });
    },
    []
  );

  const removeFromCompare = useCallback((propertyId) => {
    setCompareList((prev) => prev.filter((p) => p._id !== propertyId));
    toast.success('Removed from compare');
  }, []);

  const toggleCompare = useCallback(
    (property) => {
      const id = property?._id ?? property; // supports passing either the object or just an id
      setCompareList((prev) => {
        const exists = prev.some((p) => p._id === id);
        if (exists) {
          toast.success('Removed from compare');
          return prev.filter((p) => p._id !== id);
        }
        if (prev.length >= MAX_COMPARE) {
          toast.error(`You can only compare up to ${MAX_COMPARE} properties`);
          return prev;
        }
        toast.success('Added to compare');
        return [...prev, typeof property === 'object' ? property : { _id: id }];
      });
    },
    []
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const value = {
    compareList,
    isComparing,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    compareCount: compareList.length,
    maxCompare: MAX_COMPARE,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}