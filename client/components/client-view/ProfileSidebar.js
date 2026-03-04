'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, ShieldCheck, Key, LogOut } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function ProfileSidebar() {
    const pathname = usePathname();
    const { user, logout } = useClientAuth();

    const menuItems = [
        { icon: User, label: 'Meus Dados', href: '/profile/edit' },
        { icon: MapPin, label: 'Endereço', href: '/profile/address' },
        { icon: ShieldCheck, label: 'Segurança', href: '/profile/security' },
        { icon: Key, label: 'Meus Acessos', href: '/profile/access' },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/5 h-[calc(100vh-73px)] sticky top-[73px]">
            <div className="p-8 flex flex-col items-center text-center border-b border-white/5">
                <div className="w-24 h-24 rounded-full border-4 border-white/5 p-1 bg-slate-900 shadow-2xl mb-4 relative">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-full text-3xl font-black text-primary">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                <h2 className="text-lg font-black tracking-tight text-white">{user?.name}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
            </div>

            <nav className="flex-1 p-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all group
                                ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} strokeWidth={1.5} />
                            <span className="text-sm font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                >
                    <LogOut className="w-5 h-5 transition-colors" strokeWidth={1.5} />
                    <span className="text-sm font-bold tracking-widest uppercase">Sair</span>
                </button>
            </div>
        </aside>
    );
}
