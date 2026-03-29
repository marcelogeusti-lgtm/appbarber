'use client';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import api from '../lib/api';
import { safeGetItem, safeSetItem } from '../lib/storage';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Init theme
        const savedTheme = safeGetItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        safeSetItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        // Optional: Persist to backend if logged in
        try {
            // Need endpoint to update user theme, assuming generalized update works if field exists
            // Or create specialized endpoint. For now just local is fine for speed.
        } catch (err) {
            console.error('Error saving theme preference', err);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white transition-colors relative group"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5 text-primary/90" />
            )}
        </button>
    );
}
