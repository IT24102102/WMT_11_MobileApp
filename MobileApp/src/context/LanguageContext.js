import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import UniversalStorage from '../utils/UniversalStorage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // Default to English

    // Load persisted language on startup
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const saved = await UniversalStorage.getItem('appLanguage');
                if (saved === 'en' || saved === 'si') {
                    setLanguage(saved);
                }
            } catch (e) {
                console.log('Could not load saved language:', e);
            }
        };
        loadLanguage();
    }, []);

    const switchLanguage = async (lang) => {
        if (lang === 'en' || lang === 'si') {
            setLanguage(lang);
            try {
                await UniversalStorage.setItem('appLanguage', lang);
            } catch (e) {
                console.log('Could not persist language:', e);
            }
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
