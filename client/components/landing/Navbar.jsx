'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Scissors } from 'lucide-react';
import { Button } from '../ui/button';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user, loading, openLoginModal } = useClientAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0A0A0B]/80 backdrop-blur-3xl border-b border-white/10 py-3 shadow-2xl' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <img
                        src="/logos/logo_full.png"
                        alt="NEXT Logo"
                        className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#" className="group relative font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                    </Link>
                    <Link href="#start" className="group relative font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">
                        Sobre
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                    </Link>
                    <Link href="#features" className="group relative font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">
                        Funções
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                    </Link>
                    <Link href="#pricing" className="group relative font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">
                        Preços
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                    </Link>
                    <Link href="#" className="group relative font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">
                        Blog
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></span>
                    </Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/register">
                        <button className="h-10 px-6 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black text-white text-[11px] uppercase tracking-[0.2em] font-black rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            Teste Grátis
                        </button>
                    </Link>

                    <Link
                        href="/login"
                        className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                    >
                        Acessar
                    </Link>

                    <button
                        onClick={openLoginModal}
                        className="font-bold text-[11px] uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
                    >
                        Sou Cliente
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden fixed inset-x-0 top-[70px] bg-[#0A0A0B]/95 backdrop-blur-3xl border-b border-white/10 p-6 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="#features" onClick={() => setIsOpen(false)} className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-all">
                                Funções
                            </Link>
                            <Link href="#pricing" onClick={() => setIsOpen(false)} className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-all">
                                Preços
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Acesso ao Sistema</p>
                            
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-4 px-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all">
                                        Profissional
                                    </Link>
                                    <button
                                        onClick={() => { setIsOpen(false); openLoginModal(); }}
                                        className="flex items-center justify-center py-4 px-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-primary transition-all"
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
