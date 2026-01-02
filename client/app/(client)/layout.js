'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, User } from 'lucide-react';

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
            <main className="flex-1 pb-24">
                {children}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-2 z-50">
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
