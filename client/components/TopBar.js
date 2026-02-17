import { Menu, Search, Wallet } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ user, barbershop, isLocked, onMobileMenuClick, onOpenCashier }) {
    return (
        <header className="h-20 bg-card/90 border-b border-border px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-4 md:hidden">
                <button
                    onClick={onMobileMenuClick}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <img
                    src="/logos/logo_full.svg"
                    alt="BarbeOn"
                    className="h-8 w-auto object-contain"
                />
            </div>

            {/* Desktop Actions (Future Search/Notifications) */}
            <div className="hidden md:flex items-center gap-6">
                {/* Placeholder for Search - Common in admin dashboards */}
                <div className="relative group hidden lg:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="bg-muted/50 border border-input text-foreground text-xs rounded-full focus:ring-primary focus:border-primary block w-64 pl-10 p-2.5 outline-none transition-all focus:w-72"
                        placeholder="Buscar cliente, serviço..."
                    />
                </div>
            </div>

            {/* User & Notifications Area */}
            <div className="flex items-center gap-6 ml-auto">
                {/* Notifications & Favorites */}
                <div className="flex items-center gap-2 border-r border-border pr-6">
                    <button
                        onClick={onOpenCashier}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 mr-2"
                        title="Abrir Caixa"
                    >
                        <Wallet className="w-5 h-5" />
                        <span className="text-xs font-bold hidden xl:block">R$ Caixa</span>
                    </button>
                    <ThemeToggle />
                    <NotificationCenter />
                </div>

                {isLocked && (
                    <div className="hidden sm:flex bg-destructive/10 border border-destructive/20 px-4 py-1.5 rounded-full items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                        <span className="text-xs font-bold text-destructive uppercase tracking-widest">Acesso Suspenso</span>
                    </div>
                )}

                <div className="flex items-center gap-4 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">Bem-vindo,</p>
                        <p className="text-sm font-black text-foreground uppercase tracking-tighter">{user?.name || 'Usuário'}</p>
                    </div>
                    {barbershop?.logo_url || barbershop?.logoUrl ? (
                        <img
                            src={barbershop.logo_url || barbershop.logoUrl}
                            alt={barbershop.name || 'Logo'}
                            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            {user?.name?.[0] || 'U'}
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}
