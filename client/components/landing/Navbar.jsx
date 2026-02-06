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
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-lg border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-4 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Scissors className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold tracking-tighter text-white">
                        Barbe<span className="text-primary">On</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Funcionalidades</Link>
                    <Link href="#start" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Como Começar</Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Planos</Link>
                    <Link href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">FAQ</Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-bold text-white hover:text-primary transition-colors">
                        Entrar
                    </Link>
                    <Link href="/register">
                        <button className="bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.4)]">
                            Teste Grátis
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 animate-in slide-in-from-top-10">
                    <div className="flex flex-col gap-4">
                        <Link href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white">Funcionalidades</Link>
                        <Link href="#start" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white">Como Começar</Link>
                        <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white">Planos</Link>
                        <hr className="border-white/10" />
                        <Link href="/login" className="text-lg font-bold text-white text-center py-2">Entrar</Link>
                        <Link href="/register">
                            <button className="w-full bg-primary text-black font-bold py-3 rounded-xl">
                                Criar Conta Grátis
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
