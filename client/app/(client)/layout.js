'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, User, LogOut } from 'lucide-react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Início', href: '/home', icon: Home },
        { name: 'Buscar', href: '/search', icon: Search },
        { name: 'Agendamentos', href: '/appointments', icon: Calendar },
        { name: 'Menu', href: '/profile', icon: User },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            {/* Desktop Top Navbar */}
            <header className="hidden md:flex items-center justify-between px-8 py-5 bg-slate-950 border-b border-slate-900 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/home" className="flex items-center gap-2 group">
                        <div className="bg-emerald-500 rounded-lg p-1.5 group-hover:scale-105 transition">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                                <path d="M7 21C2.5 16.5 2 11 4 7C5.5 4 10 3 13 4C17 6 19 10 19 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">APP<span className="text-emerald-500">BARBER</span></span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="flex items-center gap-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname.startsWith(tab.href);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[3px]' : 'stroke-2'}`} />
                                    {tab.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Desktop User Actions */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                        </div>
                        <span className="hidden lg:block text-xs font-bold text-slate-300">Minha Conta</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 pb-24 md:pb-10">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar - Hidden on Desktop */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-2 z-50">
                <div className="flex justify-around items-end">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname.startsWith(tab.href);

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex flex-col items-center justify-center p-2 w-full transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-slate-800 -translate-y-1' : ''}`}>
                                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    {isActive && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold mt-1 tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
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
