import { Menu, Search, Wallet, Scissors } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ user, barbershop, isLocked, onMobileMenuClick, onOpenCashier }) {
    return (
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-4 md:hidden">
                <button
                    onClick={onMobileMenuClick}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <img
                    src="/logos/logo_full.png"
                    alt="NEXT"
                    className="h-8 w-auto object-contain"
                />
            </div>

            {/* Desktop Actions (Future Search/Notifications) */}
            <div className="hidden md:flex items-center gap-4">
                {/* Placeholder for Search - Common in admin dashboards */}
                <div className="relative group hidden lg:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="bg-muted border border-border text-foreground text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block w-64 pl-9 p-2 outline-none transition-all"
                        placeholder="Buscar cliente, serviço..."
                    />
                </div>
            </div>

            {/* User & Notifications Area */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Notifications Area */}
                <div className="flex items-center gap-1 border-r border-border pr-4">
                    <button
                        onClick={onOpenCashier}
                        className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2 mr-1"
                        title="Abrir Caixa"
                    >
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-semibold hidden xl:block">Caixa</span>
                    </button>
                    <ThemeToggle />
                    <NotificationCenter user={user} />
                </div>

                {isLocked && (
                    <div className="hidden sm:flex bg-destructive/10 border border-destructive/20 px-4 py-1.5 rounded-full items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                        <span className="text-xs font-bold text-destructive uppercase tracking-widest">Acesso Suspenso</span>
                    </div>
                )}

                <div className="flex items-center gap-3 pl-1 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5 group-hover:text-primary transition-colors">Bem-vindo,</p>
                        <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || 'Usuário'}</p>
                    </div>
                    {barbershop?.logo_url || barbershop?.logoUrl ? (
                        <img
                            src={barbershop.logo_url || barbershop.logoUrl}
                            alt={barbershop.commercialName || barbershop.name || 'Barbearia'}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary ring-1 ring-primary/20">
                            <Scissors className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}
