'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Calendar, User } from 'lucide-react';
import { ClientAuthProvider, useClientAuth } from '../../contexts/ClientAuthContext';
import LoginModal from '../../components/client-view/LoginModal';
import RegisterModal from '../../components/client-view/RegisterModal';
import ForgotPasswordModal from '../../components/client-view/ForgotPasswordModal';
import FooterCliente from '../../components/client-view/FooterCliente';
import SidebarCliente from '../../components/client-view/SidebarCliente';
import NotificationsModal from '../../components/client-view/NotificationsModal';
import ProfileDropdown from '../../components/client-view/ProfileDropdown';
import { ChevronDown, Bell, Menu as MenuIcon } from 'lucide-react';

function ClientLayoutContent({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useClientAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ROLE GUARD: Prevent non-clients (e.g. Pros) from using this layout
    useEffect(() => {
        if (!loading && user && user.role !== 'CLIENT') {
            router.push('/login');
        }
    }, [user, loading, router]);

    const tabs = [
        { name: 'Início', href: '/home', icon: Home },
        { name: 'Buscar', href: '/search', icon: Search },
        { name: 'Meus Agendamentos', href: '/appointments', icon: Calendar },
        { name: 'Menu', href: '/profile', icon: User },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <LoginModal />
            <RegisterModal />
            <ForgotPasswordModal />
            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            {/* SIDEBAR: Only for logged-in users on Desktop (default lg:block) or mobile sandwich */}
            {user && (
                <SidebarCliente isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                {/* TOP HEADER */}
                <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Sandwich Trigger: Only for Logged In */}
                        {user && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                        )}

                        <Link href="/home">
                            <img src="/logos/logo_full.png" alt="NEXT" className="h-7 w-auto" />
                        </Link>
                    </div>

                    {/* Center: Desktop Nav (Only for Visitors or specific top-nav preference - we'll keep it for now but hidden on lg if logged in) */}
                    <nav className={`hidden ${user ? 'lg:hidden md:flex' : 'md:flex'} items-center gap-8`}>
                        {tabs.slice(0, 3).map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`text-sm font-medium transition-colors ${pathname.startsWith(tab.href) ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Visual Placeholders for Theme/Lang */}
                        <div className="hidden xl:flex items-center gap-4 border-r border-white/5 pr-4 mr-2">
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                            </button>
                        </div>

                        {user && (
                            <button
                                onClick={() => setIsNotificationsOpen(true)}
                                className="p-2 text-slate-400 hover:text-white transition-colors relative"
                            >
                                <Bell className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        )}

                        <button className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors">
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        {!user && !loading && (
                            <button
                                className="bg-[#111] border border-white/10 text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
                                onClick={() => router.push('/profile')}
                            >
                                <User className="w-4 h-4" />
                                Entrar
                            </button>
                        )}

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                                                {user.name?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden lg:flex items-center gap-2 pr-2">
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{user.name}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 pb-24 md:pb-0">
                    {children}
                </main>

                {/* DESKTOP FOOTER: Only if not in Dashboard view? Or always? Let's keep it for now. */}
                <div className="hidden md:block">
                    <FooterCliente />
                </div>

                {/* MOBILE BOTTOM NAVIGATION */}
                <nav className="fixed bottom-0 left-0 right-0 bg-[#08080A]/95 backdrop-blur-lg border-t border-white/5 pb-safe pt-2 px-6 z-50 md:hidden">
                    <div className="flex justify-between items-center px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname.startsWith(tab.href);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
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
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <ClientAuthProvider>
            <ClientLayoutContent>
                {children}
            </ClientLayoutContent>
        </ClientAuthProvider>
    );
}
