import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { languages, DEFAULT_LANGUAGE, isValidLanguage } from '../i18n/languages';
import { translations, getTranslation } from '../i18n/translations';

const STORAGE_KEY = 'dietPlannerLanguage';

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (keyPath, replacements) => keyPath,
  languages,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && isValidLanguage(savedLang)) {
        return savedLang;
      }
    } catch (err) {
      console.warn('Could not access localStorage for language preference:', err);
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLang) => {
    const validLang = isValidLanguage(newLang) ? newLang : DEFAULT_LANGUAGE;
    setLanguageState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
    } catch (err) {
      console.warn('Could not save language to localStorage:', err);
    }
  };

  const t = useMemo(() => {
    return (keyPath, replacements) => getTranslation(language, keyPath, replacements);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages,
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
