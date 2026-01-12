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
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-black border-b border-white/10 sticky top-0 z-50">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/home" className="flex items-center">
                        <div className="bg-[#0D4A85] px-4 py-1.5 rounded-full flex items-center justify-center border border-white/10 shadow-lg shadow-blue-500/20">
                            <span className="text-white font-medium text-sm tracking-wide lowercase font-sans">appbarber</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="flex items-center gap-6">
                        {tabs.map((tab) => {
                            const isActive = pathname.startsWith(tab.href);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`text-sm font-medium transition-colors ${isActive ? 'text-[#3B9EFF]' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {tab.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Desktop User Actions */}
                <div className="flex items-center gap-6 text-slate-400">
                    <button className="hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg></button>
                    <button className="hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg></button>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                        <span className="text-xs font-bold">BR</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    <div className="relative">
                        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition">
                            <img src="https://github.com/marcelogeusti.png" alt="User" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center border border-black">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
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
