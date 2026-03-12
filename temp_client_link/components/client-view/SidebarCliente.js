'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Calendar, Heart, CreditCard, UserPlus,
    Package, Clock, User, ShieldCheck, Settings,
    MessageSquare, FileText, LogOut, X, Menu
} from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function SidebarCliente({ isOpen, onClose }) {
    const pathname = usePathname();
    const { logout, user } = useClientAuth();

    const menuItems = [
        { icon: Home, label: 'Início', href: '/home' },
        { icon: Calendar, label: 'Meus Agendamentos', href: '/agendamentos' },
        { icon: Heart, label: 'Favoritos', href: '/favorites' },
        { icon: CreditCard, label: 'Meus Cartões', href: '/cards' },
        { icon: UserPlus, label: 'Assinaturas', href: '/subscriptions' },
        { icon: Package, label: 'Pacotes', href: '/packages' },
        { icon: Clock, label: 'Histórico', href: '/history' },
        { icon: User, label: 'Perfil / Meus Dados', href: '/profile' },
        { icon: ShieldCheck, label: 'Segurança', href: '/profile/security' },
        { icon: Settings, label: 'Preferências', href: '/profile/preferences' },
        { icon: MessageSquare, label: 'Suporte / Ouvidoria', href: '/support' },
        { icon: FileText, label: 'Termos de Uso', href: '/terms' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-72 bg-[#0A0A0B] border-r border-white/5 
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <Link href="/home" className="flex items-center gap-2" onClick={onClose}>
                            <img src="/logos/logo_full.png" alt="NEXT" className="h-7 w-auto" />
                        </Link>
                        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                                        ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-white/5">
                        <div className="bg-white/5 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                            {user?.name?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
