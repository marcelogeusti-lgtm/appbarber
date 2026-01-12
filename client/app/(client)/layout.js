'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Calendar, User, LogOut, ChevronDown, Heart, CreditCard, Repeat, Package, Clock, MessageSquare, UserCircle } from 'lucide-react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }

        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const profileMenuItems = [
        { icon: UserCircle, label: 'Perfil', href: '/profile' }, // Maps to "Meus Dados"
        { icon: Heart, label: 'Favoritos', href: '/favorites' },
        { icon: CreditCard, label: 'Meus Cartões', href: '/cards' },
        { icon: Repeat, label: 'Assinaturas', href: '/subscriptions' },
        { icon: Package, label: 'Pacotes', href: '/packages' }, // Existing
        { icon: Clock, label: 'Histórico', href: '/history' }, // Existing
        { icon: MessageSquare, label: 'Ouvidoria', href: '/support' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#050505]">

            {/* GLOBAL HEADER (Mobile + Desktop) */}
            <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/home" className="flex items-center">
                    <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center justify-center border border-white/10 shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-bold text-xs tracking-wider uppercase font-sans">Barberon</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`text-sm font-medium transition-colors ${isActive ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-full transition border border-transparent hover:border-white/10 group"
                    >
                        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-white/5 overflow-hidden ring-2 ring-transparent group-hover:ring-white/10 transition">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">

                            {/* User Info Header */}
                            <div className="px-5 py-4 border-b border-white/5 mb-2 bg-white/2">
                                <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Visitante'}</p>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email || 'Faça login'}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-0.5 px-2">
                                {profileMenuItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition group"
                                    >
                                        <item.icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Logout */}
                            <div className="mt-2 pt-2 border-t border-white/5 px-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition font-medium"
                                >
                                    <LogOut className="w-4 h-4" /> Sair
                                </button>
                            </div>
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
