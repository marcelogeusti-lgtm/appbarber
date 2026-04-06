'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Calendar, User } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import FooterCliente from '../../components/client-view/FooterCliente';
import NotificationsModal from '../../components/client-view/NotificationsModal';
import ProfileDropdown from '../../components/client-view/ProfileDropdown';
import { ChevronDown, Bell } from 'lucide-react';

function ClientLayoutContent({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, openLoginModal } = useClientAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // ROLE GUARD: Redirect only if we explicitly want to block someone, 
    // but here we just ensure they have a profile. 
    // Professionals/Admins can also be clients, so we don't block them.
    useEffect(() => {
        if (!loading && user) {
            // No strict block here anymore to allow Multi-Role access.
            // If we needed a specific check, it would be here.
        }
    }, [user, loading, router]);

    const tabs = [
        { name: 'Início', href: '/home', icon: Home },
        { name: 'Buscar', href: '/search', icon: Search },
        { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
    ];

    const handleMenuClick = (e) => {
        if (!user) {
            e.preventDefault();
            openLoginModal();
        } else {
            router.push('/profile');
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                {/* TOP HEADER */}
                <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/home">
                            <img src="/logos/logo_full.png" alt="NEXT" className="h-8 w-auto" />
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const handleClick = (e) => {
                                if (!user && tab.name === 'Agendamentos') {
                                    e.preventDefault();
                                    openLoginModal();
                                }
                            };
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    onClick={handleClick}
                                    className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-4">
                        {user && (
                            <button
                                onClick={() => setIsNotificationsOpen(true)}
                                className="p-2 text-slate-400 hover:text-white transition-colors relative"
                            >
                                <Bell className="w-5 h-5" strokeWidth={1.5} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#050505]"></span>
                            </button>
                        )}

                        {!user && !loading && (
                            <button
                                className="bg-primary text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                onClick={openLoginModal}
                            >
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
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{user.name.split(' ')[0]}</span>
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

                <div className="hidden md:block">
                    <FooterCliente />
                </div>

                {/* MOBILE BOTTOM NAVIGATION */}
                <nav className="fixed bottom-0 left-0 right-0 bg-black/75 backdrop-blur-[10px] border-t border-white/5 pb-safe pt-2 px-6 z-50 md:hidden h-20 flex items-center justify-around">
                    {/* Início */}
                    <Link
                        href="/home"
                        className={`flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/home' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Home className={`w-5 h-5 mb-1 ${pathname === '/home' ? 'fill-current opacity-20' : ''}`} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium tracking-wide">Início</span>
                        {pathname === '/home' && <div className="w-1 h-1 bg-primary rounded-full mt-1 glow-blue" />}
                    </Link>

                    {/* Agendamentos */}
                    <Link
                        href="/agendamentos"
                        onClick={(e) => { if (!user) { e.preventDefault(); openLoginModal(); } }}
                        className={`flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/agendamentos' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Calendar className={`w-5 h-5 mb-1 ${pathname === '/agendamentos' ? 'fill-current opacity-20' : ''}`} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium tracking-wide">Agenda</span>
                        {pathname === '/agendamentos' && <div className="w-1 h-1 bg-primary rounded-full mt-1 glow-blue" />}
                    </Link>

                    {/* FLOATING ACTION BUTTON: SEARCH / LOGO ICON (CLEAN & MINIMAL STYLE) */}
                    <div className="relative -top-6">
                        <Link
                            href="/search"
                            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 overflow-hidden"
                        >
                            <img src="/logos/logo_icon.png" alt="Search" className="w-13 h-13 object-contain opacity-90 hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {/* Notificações / Favoritos? User says structure: Início, Buscar, Agendamentos, Conta. */}
                    {/* Let's follow his list: Início, Agendamentos (already did), Buscar (Floating), Notifications/Account. */}
                    
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className={`flex flex-col items-center justify-center transition-all duration-300 ${isNotificationsOpen ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Bell className={`w-5 h-5 mb-1 ${isNotificationsOpen ? 'fill-current opacity-20' : ''}`} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium tracking-wide">Avisos</span>
                    </button>

                    {/* Menu / Perfil (Unified Handler) */}
                    <button
                        onClick={handleMenuClick}
                        className={`flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/profile' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <div className={`w-5 h-5 mb-1 rounded-full border transition-colors ${pathname === '/profile' ? 'border-primary' : 'border-slate-500'} overflow-hidden bg-slate-800`}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="U" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-0.5" strokeWidth={1.5} />
                            )}
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">Menu</span>
                        {pathname === '/profile' && <div className="w-1 h-1 bg-primary rounded-full mt-1 glow-blue" />}
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <ClientLayoutContent>
            {children}
        </ClientLayoutContent>
    );
}
