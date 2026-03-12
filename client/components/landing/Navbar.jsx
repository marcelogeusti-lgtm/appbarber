'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Scissors } from 'lucide-react';
import { Button } from '../ui/button';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user, openLoginModal } = useClientAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-white py-5'}`}>
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
                    <Link href="#" className="group relative font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#start" className="group relative font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        Sobre
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#features" className="group relative font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        Funções
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#pricing" className="group relative font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        Preços
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#" className="group relative font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        Blog
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-6">

                    {user ? (
                        <Link href="/home">
                            <button className="h-10 px-6 bg-gray-900 hover:bg-black text-white text-[11px] uppercase tracking-widest font-black rounded-lg transition-all shadow-sm">
                                Minha Conta
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/register">
                                <button className="h-10 px-6 bg-transparent border-2 border-primary hover:bg-primary/5 text-primary text-[11px] uppercase tracking-widest font-black rounded-lg transition-all">
                                    Teste Grátis
                                </button>
                            </Link>

                            <Link
                                href="/login"
                                className="font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Acessar
                            </Link>

                            <button
                                onClick={openLoginModal}
                                className="font-bold text-[11px] uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                            >
                                Sou Cliente
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-gray-900" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-xl animate-in slide-in-from-top-4">
                    <div className="flex flex-col gap-5">
                        <Link href="#features" onClick={() => setIsOpen(false)} className="text-base font-medium text-gray-600 hover:text-primary transition-colors">Funcionalidades</Link>
                        <Link href="#start" onClick={() => setIsOpen(false)} className="text-base font-medium text-gray-600 hover:text-primary transition-colors">Como Começar</Link>
                        <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-base font-medium text-gray-600 hover:text-primary transition-colors">Planos</Link>
                        <hr className="border-gray-50" />
                        <Link href="/login" onClick={() => setIsOpen(false)} className="text-base font-semibold text-gray-900 text-center py-2">
                            Entrar (Barbeiro)
                        </Link>
                        {user ? (
                            <Link href="/home" onClick={() => setIsOpen(false)} className="text-base font-semibold text-gray-900 text-center py-2">
                                Minha Conta (Cliente)
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setIsOpen(false); openLoginModal(); }}
                                    className="text-base font-semibold text-gray-900 text-center py-2"
                                >
                                    Login Cliente
                                </button>
                                <Link href="/register" onClick={() => setIsOpen(false)}>
                                    <button className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-sm">
                                        Criar Conta Grátis
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
