'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Calendar, User, ChevronDown, Bell, Plus, Heart } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { ClientThemeProvider, useClientTheme } from '../../contexts/ClientThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';
import FooterCliente from '../../components/client-view/FooterCliente';
import NotificationsModal from '../../components/client-view/NotificationsModal';
import ProfileDropdown from '../../components/client-view/ProfileDropdown';
import QuickBookingModal from '../../components/client-view/QuickBookingModal';
import api from '../../lib/clientApi';

function ClientLayoutContent({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, openLoginModal } = useClientAuth();
    const { theme } = useClientTheme();
    const { t } = useTranslation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const res = await api.get('/barbershops/my/favorites');
            setFavorites(res.data || []);
        } catch (error) {
            console.warn('Error fetching favorites for quick nav:', error);
        }
    };

    const tabs = [
        { name: t('clientApp.nav.home'), href: '/inicio', icon: Home },
        { name: t('clientApp.nav.search'), href: '/buscar', icon: Search },
        { name: t('clientApp.nav.agenda'), href: '/agenda', icon: Calendar },
    ];

    const handleQuickBookingClick = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        if (favorites.length > 0) {
            setIsQuickBookingOpen(true);
        } else {
            router.push('/buscar');
        }
    };

    const handleMenuClick = (e) => {
        if (!user) {
            e.preventDefault();
            openLoginModal();
        } else {
            e.preventDefault();
            setIsProfileOpen(!isProfileOpen);
        }
    };

    return (
        <div className={`flex h-screen bg-[#050505] text-white overflow-hidden ${theme === 'light' ? 'client-light' : ''}`}>
            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            <QuickBookingModal 
                isOpen={isQuickBookingOpen} 
                onClose={() => setIsQuickBookingOpen(false)} 
                favorites={favorites}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
                {/* TOP HEADER */}
                <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/inicio">
                            <img src="/logos/logo_full.png" alt="NEXT" className="h-8 w-auto" />
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-2">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const handleClick = (e) => {
                                if (!user && tab.name === 'Agenda') {
                                    e.preventDefault();
                                    openLoginModal();
                                }
                            };
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    onClick={handleClick}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                        isActive 
                                        ? 'bg-white/10 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
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
                                className="p-2 text-slate-400 hover:text-white transition-colors relative group"
                            >
                                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
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
                                                {user?.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden lg:flex items-center gap-2 pr-2">
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{user?.name?.split(' ')[0]}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 pb-32 md:pb-0">
                    {children}
                </main>

                <div className="hidden md:block">
                    <FooterCliente />
                </div>

                {/* MOBILE BOTTOM NAVIGATION */}
                <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-[20px] border-t border-white/5 pb-safe pt-2 px-2 z-50 md:hidden h-[74px] flex items-center justify-between">
                    {/* Início */}
                    <Link
                        href="/inicio"
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/inicio' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Home className={`w-5 h-5 mb-1 ${pathname === '/inicio' ? 'fill-current opacity-20' : ''}`} strokeWidth={2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Início</span>
                    </Link>

                    {/* Buscar */}
                    <Link
                        href="/buscar"
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/buscar' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Search className={`w-5 h-5 mb-1 ${pathname === '/buscar' ? 'fill-current opacity-20' : ''}`} strokeWidth={2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Buscar</span>
                    </Link>

                    {/* CENTER LOGO - AGENDA */}
                    <Link
                        href="/agenda"
                        onClick={(e) => { if (!user) { e.preventDefault(); openLoginModal(); } }}
                        className={`flex-[1.2] flex flex-col items-center justify-center transition-all duration-300 relative h-full`}
                    >
                        {/* The floating logo */}
                        <div className={`absolute -top-11 w-[72px] h-[72px] bg-primary rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(37,99,235,0.6)] transform transition-all active:scale-95 border-[6px] border-[#0A0A0A] overflow-hidden`}>
                            <img src="/logos/logo_icon.png" alt="Agenda" className="w-full h-full object-cover" />
                            {pathname === '/agenda' && (
                                <div className="absolute -bottom-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(37,99,235,1)]"></div>
                            )}
                        </div>
                    </Link>

                    {/* Favoritos */}
                    <Link
                        href="/favoritos"
                        onClick={(e) => { if (!user) { e.preventDefault(); openLoginModal(); } }}
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/favoritos' ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <Heart className={`w-5 h-5 mb-1 ${pathname === '/favoritos' ? 'fill-current opacity-20' : ''}`} strokeWidth={2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Favoritos</span>
                    </Link>

                    {/* Perfil */}
                    <button
                        onClick={handleMenuClick}
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${isProfileOpen ? 'text-primary' : 'text-slate-500'}`}
                    >
                        <div className={`w-5 h-5 mb-1 rounded-full border-2 transition-colors ${isProfileOpen ? 'border-primary' : 'border-slate-500'} overflow-hidden bg-slate-800`}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="U" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-0.5" strokeWidth={2} />
                            )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Perfil</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <ClientThemeProvider>
            <ClientLayoutContent>
                {children}
            </ClientLayoutContent>
        </ClientThemeProvider>
    );
}
