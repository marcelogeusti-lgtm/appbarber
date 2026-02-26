'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Scissors } from 'lucide-react';
import { Button } from '../ui/button';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
                        src="/logos/NEXT_logo.svg"
                        alt="NEXT Logo"
                        className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Funcionalidades</Link>
                    <Link href="#start" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Como Começar</Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Planos</Link>
                    <Link href="#faq" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">FAQ</Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                        Entrar
                    </Link>
                    <Link href="/register">
                        <button className="h-9 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all shadow-sm">
                            Teste Grátis
                        </button>
                    </Link>
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
                        <Link href="/login" className="text-base font-semibold text-gray-900 text-center py-2">Entrar</Link>
                        <Link href="/register">
                            <button className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-sm">
                                Criar Conta Grátis
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
