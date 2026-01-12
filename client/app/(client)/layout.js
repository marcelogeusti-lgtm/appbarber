'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Calendar, User, LogOut, ChevronDown, Menu as MenuIcon } from 'lucide-react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const tabs = [
        { name: 'Início', href: '/home', icon: Home },
        { name: 'Buscar', href: '/search', icon: Search },
        { name: 'Agendamentos', href: '/appointments', icon: Calendar },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#050505]">

            {/* GLOBAL HEADER (Mobile + Desktop) */}
            <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/home" className="flex items-center">
                    <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center justify-center border border-white/10 shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-bold text-xs tracking-wider uppercase font-sans">Barberon</span>
                    </div>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-full pr-3 transition border border-transparent hover:border-white/10"
                    >
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-white/5 overflow-hidden">
                            <User className="w-4 h-4" />
                        </div>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#111111] border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-slate-800/50 mb-1">
                                <p className="text-[10px] uppercase font-bold text-slate-500">Minha Conta</p>
                            </div>

                            <Link
                                href="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                            >
                                <User className="w-4 h-4" /> Meus Dados
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition mt-1 border-t border-slate-800/50"
                            >
                                <LogOut className="w-4 h-4" /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 pb-24 md:pb-10">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08080A]/95 backdrop-blur-lg border-t border-white/5 pb-safe pt-2 px-6 z-50">
                <div className="flex justify-between items-center px-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname.startsWith(tab.href);

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${isActive ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {tab.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
