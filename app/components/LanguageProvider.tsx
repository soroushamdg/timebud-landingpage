"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { type LangCode, RTL_LANGS } from "@/app/i18n/translations";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  const setLang = (l: LangCode) => {
    setLangState(l);
    // Update HTML attributes so CSS :lang() selectors and dir work
    document.documentElement.lang = l;
    document.documentElement.dir = RTL_LANGS.includes(l) ? "rtl" : "ltr";
  };

  // Sync HTML attributes on mount (default state)
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
