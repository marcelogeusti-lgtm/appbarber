'use client';
import { createContext, useContext, useState, useEffect } from 'react';

import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

const translations = { pt, en, es };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('pt');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('appbarber_lang');
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang);
        } else {
            setLanguage('pt');
        }
        setMounted(true);
    }, []);

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
            localStorage.setItem('appbarber_lang', lang);
        }
    };

    const t = (key) => {
        // Para evitar Hydration Mismatch, usamos os textos em português no primeiro render no servidor.
        const keys = key.split('.');
        const langToUse = mounted ? language : 'pt';
        let value = translations[langToUse];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key; // Fallback se a chave não existir
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
