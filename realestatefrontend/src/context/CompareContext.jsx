// src/context/CompareContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  // Load compare list from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch {
        setCompareList([]);
      }
    }
  }, []);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (property) => {
    // Check if already in compare list
    if (compareList.some(p => p._id === property._id)) {
      toast.info('Property already in comparison list');
      return;
    }

    // Check max limit (usually 4)
    if (compareList.length >= 4) {
      toast.error('You can compare up to 4 properties at a time');
      return;
    }

    setCompareList([...compareList, property]);
    toast.success('Property added to comparison');
  };

  const removeFromCompare = (propertyId) => {
    setCompareList(compareList.filter(p => p._id !== propertyId));
    toast.success('Property removed from comparison');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (propertyId) => {
    return compareList.some(p => p._id === propertyId);
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isComparing,
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};