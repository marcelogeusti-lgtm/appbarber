'use client';
import Link from 'next/link';
import { User, Heart, CreditCard, Sparkles, Box, History, LogOut, ChevronRight } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function ProfileDropdown({ isOpen, onClose }) {
    const { user, logout } = useClientAuth();

    if (!isOpen) return null;

    return (
        <div className="absolute top-14 right-0 w-64 bg-[#111] border border-white/5 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>

            {/* Links */}
            <div className="p-2">
                <Link
                    href="/profile"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Perfil</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>

                <Link
                    href="/favorites"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Favoritos</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>

                <Link
                    href="/cards"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Meus Cartões</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>

                <Link
                    href="/subscriptions"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Assinaturas</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>

                <Link
                    href="/packages"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <Box className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Pacotes</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>

                <Link
                    href="/history"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-3">
                        <History className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Histórico</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </Link>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-white/5">
                <button
                    onClick={() => {
                        logout();
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all group"
                >
                    <LogOut className="w-4 h-4 text-red-500/70 group-hover:text-red-500" />
                    <span className="text-xs font-bold text-red-500/70 group-hover:text-red-500">Sair</span>
                </button>
            </div>
        </div>
    );
}
