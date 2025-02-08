import { createContext, useContext, useState } from "react";
import { translations, type Language } from "@/lib/translations";

type TranslationSections = typeof translations.en;
type TranslationKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof TranslationSections, key: TranslationKeys<TranslationSections>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (section: keyof TranslationSections, key: TranslationKeys<TranslationSections>): string => {
    return translations[language][section]?.[key] || `${section}.${key}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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