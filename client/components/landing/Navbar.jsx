'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { trackEvent } from '../../lib/analytics';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { openLoginModal } = useClientAuth();
    const { t, language, changeLanguage } = useTranslation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const languages = [
        { code: 'pt', label: t('navbar.lang_pt'), flag: '🇧🇷' },
        { code: 'en', label: t('navbar.lang_en'), flag: '🇺🇸' },
        { code: 'es', label: t('navbar.lang_es'), flag: '🇪🇸' },
    ];

    const navLinks = [
        { label: t('navbar.about'),    href: '#start' },
        { label: t('navbar.features'), href: '#features' },
        { label: t('navbar.pricing'),  href: '#pricing' },
        { label: t('navbar.faq'),      href: '#faq' },
    ];

    const currentLang = languages.find(l => l.code === language);

    return (
        <header
            className={`fixed inset-x-0 top-4 z-50 mx-auto flex max-w-6xl flex-col transition-all duration-300 ${
                isScrolled
                    ? 'rounded-[2rem] border border-white/[0.08] bg-[#0A0A0C]/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
                    : 'rounded-[2rem] border border-transparent bg-transparent'
            } w-[calc(100%-2rem)]`}
        >
            <div className="flex h-14 items-center justify-between px-5">

                {/* Logo */}
                <Link href="/" className="shrink-0 group">
                    <img
                        src="/logos/logo_full.svg"
                        alt="NEXT"
                        className="h-8 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
                    />
                </Link>

                {/* Desktop Center — nav links + language switcher */}
                <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-white/55">
                    {navLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="transition-colors duration-200 hover:text-white font-body"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            onBlur={() => setTimeout(() => setIsLangOpen(false), 150)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/55 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white font-body"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{currentLang?.label}</span>
                            <span className="sm:hidden">{currentLang?.flag}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLangOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-2xl bg-[#111113] border border-white/10 shadow-2xl overflow-hidden py-1.5 z-50">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors flex items-center gap-3 font-body ${
                                            language === lang.code
                                                ? 'text-primary bg-primary/5'
                                                : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <span>{lang.flag}</span>
                                        {lang.label}
                                        {language === lang.code && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Desktop Right — Sou Cliente · Acessar · Teste Grátis */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Sou Cliente — client booking portal */}
                    <button
                        onClick={openLoginModal}
                        className="rounded-full px-4 py-2 text-[13px] font-medium text-white/55 transition-colors duration-200 hover:text-white hover:bg-white/[0.05] font-body"
                    >
                        {t('navbar.customer')}
                    </button>

                    {/* Acessar — barber/owner login */}
                    <Link
                        href="/login"
                        className="rounded-full px-4 py-2 text-[13px] font-medium text-white/65 transition-colors duration-200 hover:text-white hover:bg-white/[0.05] font-body"
                    >
                        {t('navbar.login')}
                    </Link>

                    {/* Teste Grátis CTA */}
                    <Link href="/register" onClick={() => trackEvent('cta_click', { location: 'navbar', label: 'freeTrial' })}>
                        <button className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-[0_0_20px_-8px_rgba(77,114,228,0.8)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_-4px_rgba(77,114,228,0.9)] font-body">
                            {t('navbar.freeTrial')}
                            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
                    aria-label="Menu"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-white/[0.06]">
                    <nav className="flex flex-col gap-1 px-5 pb-5 pt-2">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="flex min-h-[44px] items-center rounded-xl px-4 text-[14px] font-medium text-white/70 hover:bg-white/[0.04] hover:text-white transition-colors font-body"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="my-2 h-px w-full bg-white/[0.06]" />

                        {/* Mobile Language Switcher */}
                        <div className="mb-3 flex gap-2 px-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all font-body ${
                                        language === lang.code
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-white/40 hover:text-white hover:bg-white/[0.04] border border-white/[0.06]'
                                    }`}
                                >
                                    {lang.flag}
                                </button>
                            ))}
                        </div>

                        {/* Mobile CTAs */}
                        <div className="flex flex-col gap-2 sm:flex-row mt-1">
                            <button
                                onClick={() => { setIsOpen(false); openLoginModal(); }}
                                className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 px-4 text-[14px] font-medium text-primary hover:bg-primary/5 transition-colors font-body"
                            >
                                {t('navbar.customer')}
                            </button>
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 px-4 text-[14px] font-medium text-white hover:bg-white/[0.04] transition-colors font-body"
                            >
                                {t('navbar.login')}
                            </Link>
                        </div>
                        <Link href="/register" onClick={() => { setIsOpen(false); trackEvent('cta_click', { location: 'navbar_mobile', label: 'freeTrial' }); }}>
                            <button className="mt-2 w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-4 text-[14px] font-bold text-white transition-all hover:bg-primary/90 font-body">
                                {t('navbar.freeTrial')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
