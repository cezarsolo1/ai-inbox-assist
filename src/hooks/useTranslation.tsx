import { createContext, useContext, ReactNode } from 'react';
import nlTranslations from '@/locales/nl.json';
import enTranslations from '@/locales/en.json';

type TranslationKey = string;
type Translations = Record<string, any>;

interface TranslationContextType {
  t: (key: TranslationKey) => string;
  language: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Default to Dutch, fallback to English
const DEFAULT_LANGUAGE = 'nl';
const translations: Record<string, Translations> = {
  nl: nlTranslations,
  en: enTranslations
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[DEFAULT_LANGUAGE];
    
    // Try to find the translation in Dutch first
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }
    
    // If not found in Dutch, try English as fallback
    if (value === null || typeof value !== 'string') {
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = null;
          break;
        }
      }
    }
    
    // Return the found translation or the key itself if not found
    return (typeof value === 'string' ? value : key);
  };

  return (
    <TranslationContext.Provider value={{ t, language: DEFAULT_LANGUAGE }}>
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