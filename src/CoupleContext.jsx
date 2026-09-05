import { createContext, useContext, useState } from 'react';
import { couple as defaultCouple } from './coupleData';

const CoupleContext = createContext();

export function CoupleProvider({ children, initialData = null }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('sophia_dev_custom_couple_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultCouple, ...parsed };
      }
    } catch (e) {
      console.error("Error reading initial couple config from localStorage:", e);
    }
    return initialData || defaultCouple;
  });

  const setCouple = (newData) => {
    setData((prev) => {
      const resolved = typeof newData === 'function' ? newData(prev) : newData;
      try {
        localStorage.setItem('sophia_dev_custom_couple_config', JSON.stringify(resolved));
      } catch (e) {
        console.error("Error saving couple config to localStorage:", e);
      }
      return resolved;
    });
  };

  return (
    <CoupleContext.Provider value={{ couple: data, setCouple }}>
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return context;
}
