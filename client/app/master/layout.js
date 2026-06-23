'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, Store, DollarSign, Settings } from 'lucide-react';
import Link from 'next/link';
import { safeGetItem, safeClear } from '../../../lib/storage';

export default function MasterLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            if (pathname === '/master/login') {
                setLoading(false);
                return;
            }

            try {
                const token = safeGetItem('token');
                if (!token) {
                    router.push('/master/login');
                    return;
                }

                const userData = safeGetItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    if (parsedUser.role !== 'SUPER_ADMIN') {
                        // Kick out non-super admins
                        router.push('/login');
                        return;
                    }
                    setUser(parsedUser);
                    setLoading(false);
                } else {
                    safeClear();
                    router.push('/master/login');
                }
            } catch (err) {
                console.error('Error parsing user data in master layout:', err);
                safeClear();
                router.push('/master/login');
            }
        };

        checkAuth();
    }, [router, pathname]);

    const logout = () => {
        safeClear();
        router.push('/master/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If it's the login page, just render it without the sidebar
    if (pathname === '/master/login') {
        return children;
    }

    if (!user) return null;

    const navItems = [
        { name: 'Visão Geral', href: '/master', icon: LayoutDashboard },
        { name: 'Barbearias', href: '/master/barbershops', icon: Store },
        { name: 'Financeiro', href: '/master/finance', icon: DollarSign },
        { name: 'Configurações', href: '/master/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/20">
            {/* Sidebar Exclusiva do Master */}
            <aside className="w-64 border-r border-white/5 bg-[#0F0F0F] hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-xs text-white">SA</div>
                        SaaS<span className="text-primary italic">MASTER</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <p className="text-[10px] text-primary uppercase tracking-widest font-black">Super Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 bg-[#0F0F0F] flex items-center justify-between px-4">
                    <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                        SaaS<span className="text-primary italic">MASTER</span>
                    </h1>
                    <button onClick={logout} className="p-2 text-white/60 hover:text-white">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
