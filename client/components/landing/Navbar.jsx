'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Wifi, Battery } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user, loading, openLoginModal } = useClientAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav 
            className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled 
                    ? 'top-4 w-[92%] max-w-6xl rounded-full bg-[#0A0A0C]/75 backdrop-blur-xl border border-white/[0.08] py-2 px-3 shadow-[0_30px_70px_rgba(0,0,0,0.85),_inset_0_1px_0_rgba(255,255,255,0.05)]' 
                    : 'top-0 w-full rounded-none bg-transparent py-6 border-b border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <img
                        src="/logos/logo_full.svg"
                        alt="NEXT Logo"
                        className="h-9 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Desktop Menu - Centered links */}
                <div className="hidden md:flex items-center gap-7">
                    {['Home', 'Sobre', 'Funções', 'Preços'].map((item, i) => (
                        <Link 
                            key={i} 
                            href={['#', '#start', '#features', '#pricing'][i]} 
                            className="group relative font-medium text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300 font-body"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-primary to-blue-400 transition-all duration-500 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                    <Link href="/register">
                        <button className="h-9 px-5 bg-primary hover:bg-primary/90 text-white text-[10px] uppercase tracking-[0.2em] font-black rounded-full transition-all shadow-[0_0_20px_rgba(77,114,228,0.2)] flex items-center justify-center gap-1.5 group/btn">
                            Teste Grátis
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </button>
                    </Link>

                    <Link
                        href="/login"
                        className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                    >
                        Acessar
                    </Link>

                    <button
                        onClick={openLoginModal}
                        className="font-bold text-[10px] uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
                    >
                        Sou Cliente
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
            </div>

            {/* Mobile Menu overlay - Dynamic rounded curves */}
            {isOpen && (
                <div 
                    className={`md:hidden absolute left-0 right-0 w-full p-6 shadow-2xl animate-in slide-in-from-top-2 duration-300 z-40 ${
                        isScrolled 
                            ? 'top-[54px] bg-[#0A0A0C]/95 backdrop-blur-xl border border-white/[0.08] rounded-[2rem]' 
                            : 'top-[75px] bg-[#0A0A0B]/95 backdrop-blur-3xl border-b border-white/10'
                    }`}
                >
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Link 
                                href="#features" 
                                onClick={() => setIsOpen(false)} 
                                className="flex items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-all"
                            >
                                Funções
                            </Link>
                            <Link 
                                href="#pricing" 
                                onClick={() => setIsOpen(false)} 
                                className="flex items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-all"
                            >
                                Preços
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Acesso ao Sistema</p>

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link 
                                        href="/login" 
                                        onClick={() => setIsOpen(false)} 
                                        className="flex items-center justify-center py-4 px-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all"
                                    >
                                        Profissional
                                    </Link>
                                    <button
                                        onClick={() => { setIsOpen(false); openLoginModal(); }}
                                        className="flex items-center justify-center py-4 px-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] rounded-xl text-[11px] font-black uppercase tracking-widest text-primary transition-all"
                                    >
                                        Cliente
                                    </button>
                                </div>
                                <Link href="/register" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all">
                                        Criar Conta Grátis
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
