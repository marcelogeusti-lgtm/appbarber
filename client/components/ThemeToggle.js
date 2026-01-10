'use client';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import api from '../lib/api';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Init theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        if (newTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

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
                <Moon className="w-5 h-5 text-emerald-600" />
            )}
        </button>
    );
}
