'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/clientApi';
import { safeGetItem, safeSetItem } from '../lib/storage';

// Tema do APP DO CLIENTE (dark é o padrão da marca; light é opcional).
// Persistência: localStorage (imediata) + Client.theme no banco (quando logado).
const ClientThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} });

export function ClientThemeProvider({ children }) {
    const [theme, setThemeState] = useState('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = safeGetItem('clientTheme');
        if (saved === 'light' || saved === 'dark') {
            setThemeState(saved);
        }
        setMounted(true);
    }, []);

    const setTheme = (next) => {
        if (next !== 'light' && next !== 'dark') return;
        setThemeState(next);
        safeSetItem('clientTheme', next);

        // Sincroniza com a conta (não bloqueia a UI; ignora falha se deslogado)
        if (safeGetItem('clientToken')) {
            api.put('/clients/profile', { theme: next }).catch(() => {});
        }
    };

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    return (
        <ClientThemeContext.Provider value={{ theme: mounted ? theme : 'dark', setTheme, toggleTheme, mounted }}>
            {children}
        </ClientThemeContext.Provider>
    );
}

export const useClientTheme = () => useContext(ClientThemeContext);
