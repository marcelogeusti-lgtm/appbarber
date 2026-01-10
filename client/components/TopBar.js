import { Menu, Search, Wallet } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ user, isLocked, onMobileMenuClick, onOpenCashier }) {
    return (
        <header className="h-20 bg-card/90 border-b border-border px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-4 md:hidden">
                <button
                    onClick={onMobileMenuClick}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-black uppercase text-xl tracking-tighter text-white">
                    <span className="text-emerald-500 italic">Barbe</span>-On
                </span>
            </div>

            {/* Desktop Actions (Future Search/Notifications) */}
            <div className="hidden md:flex items-center gap-6">
                {/* Placeholder for Search - Common in admin dashboards */}
                <div className="relative group hidden lg:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="bg-slate-900/50 border border-slate-700 text-slate-300 text-xs rounded-full focus:ring-emerald-500 focus:border-emerald-500 block w-64 pl-10 p-2.5 outline-none transition-all focus:w-72"
                        placeholder="Buscar cliente, serviço..."
                    />
                </div>
            </div>

            {/* User & Notifications Area */}
            <div className="flex items-center gap-6 ml-auto">
                {/* Notifications & Favorites */}
                <div className="flex items-center gap-2 border-r border-slate-700 pr-6">
                    <button
                        onClick={onOpenCashier}
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-2 mr-2"
                        title="Abrir Caixa"
                    >
                        <Wallet className="w-5 h-5" />
                        <span className="text-xs font-bold hidden xl:block">R$ Caixa</span>
                    </button>
                    <ThemeToggle />
                    <NotificationCenter />
                </div>

                {isLocked && (
                    <div className="hidden sm:flex bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Acesso Suspenso</span>
                    </div>
                )}

                <div className="flex items-center gap-4 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover:text-emerald-500 transition-colors">Bem-vindo,</p>
                        <p className="text-sm font-black text-white uppercase tracking-tighter">{user?.name || 'Usuário'}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        {user?.name?.[0] || 'U'}
                    </div>
                </div>
            </div>
        </header >
    );
}
