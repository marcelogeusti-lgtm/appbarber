'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, ShieldCheck, Key, CreditCard, SlidersHorizontal, LogOut } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function ProfileSidebar() {
    const pathname = usePathname();
    const { user, logout } = useClientAuth();
    const { t } = useTranslation();

    const menuItems = [
        { icon: User, label: t('clientApp.menu.myData'), href: '/perfil/editar' },
        { icon: MapPin, label: t('clientApp.menu.addresses'), href: '/perfil/endereco' },
        { icon: CreditCard, label: t('clientApp.menu.cards'), href: '/cartoes' },
        { icon: ShieldCheck, label: t('clientApp.menu.security'), href: '/perfil/seguranca' },
        { icon: Key, label: t('clientApp.menu.access'), href: '/perfil/acesso' },
        { icon: SlidersHorizontal, label: t('clientApp.menu.preferences'), href: '/perfil/preferencias' },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/5 h-[calc(100vh-73px)] sticky top-[73px] bg-[#0A0A0B]/80 backdrop-blur-2xl z-20">
            <div className="p-8 flex flex-col items-center text-center border-b border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full border-4 border-white/5 p-1 bg-slate-900 shadow-2xl mb-4 relative z-10"
                >
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-full text-3xl font-black text-primary">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse pointer-events-none" />
                </motion.div>
                <h2 className="text-lg font-black tracking-tight text-white relative z-10">{user?.name}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 relative z-10">{user?.email}</p>
            </div>

            <nav className="flex-1 p-6 space-y-3">
                {menuItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link
                                href={item.href}
                                className={`
                                    relative flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all group overflow-hidden
                                    ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActive"
                                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 transition-colors relative z-10 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} strokeWidth={isActive ? 2 : 1.5} />
                                <span className="text-sm font-bold relative z-10">{item.label}</span>
                                {isActive && <div className="absolute right-4 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5 bg-[#050505]/40">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all group group relative overflow-hidden"
                >
                    <LogOut className="w-5 h-5 transition-colors relative z-10" strokeWidth={1.5} />
                    <span className="text-sm font-bold tracking-widest uppercase relative z-10">{t('clientApp.menu.logout')}</span>
                </button>
            </div>
        </aside>
    );
}
