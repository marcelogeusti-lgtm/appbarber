import Link from 'next/link';
import {
    User, Heart, CreditCard, Sparkles, Box,
    History, LogOut, ChevronRight, Key,
    MapPin, ShieldCheck, Settings, MessageSquare,
    FileText
} from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function ProfileDropdown({ isOpen, onClose }) {
    const { user, logout } = useClientAuth();

    if (!isOpen) return null;

    const sections = [
        {
            items: [
                { icon: User, label: 'Meus Dados', href: '/perfil/editar' },
                { icon: Key, label: 'Meus Acessos', href: '/perfil/acesso' },
                { icon: MapPin, label: 'Endereço', href: '/perfil/endereco' },
            ]
        },
        {
            items: [
                { icon: Heart, label: 'Favoritos', href: '/favoritos' },
                { icon: CreditCard, label: 'Meus Cartões', href: '/cartoes' },
                { icon: Sparkles, label: 'Assinaturas', href: '/assinaturas' },
                { icon: Box, label: 'Pacotes', href: '/pacotes' },
                { icon: ShieldCheck, label: 'Segurança', href: '/perfil/seguranca' },
                { icon: History, label: 'Histórico', href: '/historico' },
            ]
        },
        {
            items: [
                { icon: Settings, label: 'Preferências', href: '/perfil/preferencias' },
                { icon: MessageSquare, label: 'Ouvidoria', href: '/suporte' },
                { icon: FileText, label: 'Termos de Uso', href: '/termos' },
            ]
        }
    ];

    return (
        <>
            {/* Backdrop for mobile/tablet to close on click outside if needed, though usually handled by parent */}
            <div className="fixed inset-0 z-[90] lg:hidden" onClick={onClose} />

            <div className="absolute top-14 right-0 w-72 bg-[#0A0A0B] border border-white/5 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                {/* User Info Header */}
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary/20 bg-slate-900 overflow-hidden shrink-0">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-primary bg-primary/5">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate uppercase tracking-tight">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-widest">{user?.email}</p>
                    </div>
                </div>

                {/* Scrolled Content Area */}
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className={`p-2 ${sIdx !== sections.length - 1 ? 'border-b border-white/5' : ''}`}>
                            {section.items.map((item, iIdx) => (
                                <Link
                                    key={iIdx}
                                    href={item.href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                                    onClick={onClose}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-800 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Logout Footer */}
                <div className="p-4 bg-[#0F0F10] border-t border-white/5">
                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all group group"
                    >
                        <LogOut className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span className="text-[11px] font-black text-red-500 group-hover:text-white uppercase tracking-[0.2em]">Sair da Conta</span>
                    </button>
                    <p className="text-center text-[8px] text-slate-700 font-bold uppercase tracking-widest mt-4">AppBarber v2.0</p>
                </div>
            </div>
        </>
    );
}
