"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationContextType {
  showEnglish: boolean;
  toggleEnglish: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [showEnglish, setShowEnglish] = useState(false);

  // Persistence (Optional)
  useEffect(() => {
    const saved = localStorage.getItem('showEnglish');
    if (saved !== null) {
      setShowEnglish(JSON.parse(saved));
    }
  }, []);

  const toggleEnglish = () => {
    setShowEnglish((prev) => {
      const newVal = !prev;
      localStorage.setItem('showEnglish', JSON.stringify(newVal));
      return newVal;
    });
  };

  return (
    <TranslationContext.Provider value={{ showEnglish, toggleEnglish }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
