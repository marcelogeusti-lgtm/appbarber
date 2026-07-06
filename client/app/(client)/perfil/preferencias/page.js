'use client';
import { ArrowLeft, Moon, Sun, Globe, Bell, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import { useClientTheme } from '../../../../contexts/ClientThemeContext';
import { useTranslation } from '../../../../contexts/LanguageContext';

const LANGUAGES = [
    { code: 'pt', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
];

export default function PreferencesPage() {
    const { theme, toggleTheme } = useClientTheme();
    const { t, language, changeLanguage } = useTranslation();
    const isDark = theme === 'dark';

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
            <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">

                {/* Header */}
                <header className="flex items-center gap-4 mb-2">
                    <Link href="/perfil" className="p-2.5 -ml-2 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter sm:text-2xl">
                            {t('clientApp.prefs.title')}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{t('clientApp.prefs.subtitle')}</p>
                    </div>
                </header>

                <div className="space-y-6">

                    {/* Appearance */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{t('clientApp.prefs.appearance')}</h2>

                        <button
                            onClick={toggleTheme}
                            className="w-full bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-primary/40 transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">{isDark ? t('clientApp.prefs.darkMode') : t('clientApp.prefs.lightMode')}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                        {isDark ? t('clientApp.prefs.darkModeDesc') : t('clientApp.prefs.lightModeDesc')}
                                    </p>
                                </div>
                            </div>
                            {/* Switch */}
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-primary ring-4 ring-primary/10' : 'bg-slate-800 ring-4 ring-slate-800/20'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDark ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> {t('clientApp.prefs.language')}
                        </h2>
                        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm overflow-hidden divide-y divide-slate-800/50">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className={`font-bold text-sm ${language === lang.code ? 'text-white' : 'text-slate-500'}`}>
                                            {lang.label}
                                        </span>
                                    </div>
                                    {language === lang.code && (
                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-1">{t('clientApp.prefs.languageDesc')}</p>
                    </div>

                    {/* Shortcuts */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{t('clientApp.prefs.shortcuts')}</h2>

                        <Link href="/perfil/seguranca" className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">{t('clientApp.prefs.securityShortcut')}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('clientApp.prefs.securityShortcutDesc')}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('clientApp.prefs.open')}</span>
                        </Link>

                        <Link href="/perfil" className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">{t('clientApp.prefs.notifShortcut')}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('clientApp.prefs.notifShortcutDesc')}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('clientApp.prefs.open')}</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
