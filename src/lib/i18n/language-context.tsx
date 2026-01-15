'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Language, type TranslationStrings, getTranslations, t as translate } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'egp-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<TranslationStrings>(getTranslations('en'));

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'tpi')) {
      setLanguageState(stored);
      setTranslations(getTranslations(stored));
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    localStorage.setItem(STORAGE_KEY, lang);

    // Update document lang attribute
    document.documentElement.lang = lang === 'tpi' ? 'tpi' : 'en';
  }, []);

  const translateKey = useCallback((key: string) => {
    return translate(language, key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t: translations,
      translate: translateKey,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export hook alias for convenience
export const useTranslation = useLanguage;
