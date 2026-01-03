'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Calendar, PieChart, BadgeDollarSign, Users2,
    Contact2, Receipt, CreditCard,
    Wallet2, Settings, LogOut, Store, Menu, ShoppingBag
} from 'lucide-react';

function SidebarLink({ href, icon, label, active = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${active
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
        >
            {icon}
            <span className="uppercase tracking-widest">{label}</span>
        </Link>
    );
}

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) router.push('/login');

            const userData = localStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        } catch (err) {
            console.error('Error parsing user data in layout:', err);
            router.push('/login');
        }
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (!user) return null;

    const isSubscriptionActive = () => {
        if (user?.role === 'CLIENT' || user?.role === 'SUPER_ADMIN') return true;
        const shop = user?.barbershop || user?.workedBarbershop || user?.ownedBarbershops?.[0];
        // Se não tiver shop associado (recém criado sem shop?), talvez liberar ou bloquear. 
        // Assumindo 'ACTIVE' default se não tiver info, ou pegando do user.
        return shop?.subscriptionStatus === 'ACTIVE';
    };

    const isLocked = !isSubscriptionActive();

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#0a0f1a] text-slate-300 font-sans selection:bg-emerald-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111827] border-r border-slate-800/50 hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <span className="text-emerald-500 italic">Barbe</span>-On
                    </h2>

                    {/* Barbershop Status Selector */}
                    <div className={`mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4 group cursor-pointer transition-all ${isLocked ? 'border-red-500/50' : 'hover:border-emerald-500/50'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform ${isLocked ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20 group-hover:scale-110'}`}>
                            {isLocked ? <LogOut className="w-6 h-6 text-white" /> : <Store className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Unidade</p>
                            <h3 className="text-sm font-black text-white truncate uppercase tracking-tighter">{user?.barbershop?.name || 'Barbearia'}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isLocked ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {isLocked ? 'Inativa' : 'Ativa'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className={`flex-1 px-4 space-y-8 mt-4 overflow-y-auto pb-10 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {/* VISÃO GERAL */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Visão Geral</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard" icon={<PieChart className="w-4 h-4" />} label="Dashboard" />
                        </div>
                    </div>

                    {/* AGENDAMENTOS */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Agendamentos</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/schedule" icon={<Calendar className="w-4 h-4" />} label="Agenda" />
                        </div>
                    </div>

                    {/* GESTÃO */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Gestão</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/professionals" icon={<Users2 className="w-4 h-4" />} label="Equipe" />
                            <SidebarLink href="/dashboard/services" icon={<Store className="w-4 h-4" />} label="Serviços" />
                            <SidebarLink href="/dashboard/products" icon={<ShoppingBag className="w-4 h-4" />} label="Produtos" />
                            <SidebarLink href="/dashboard/orders" icon={<Receipt className="w-4 h-4" />} label="Comandas" />
                        </div>
                    </div>

                    {/* FINANCEIRO */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Financeiro</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/finance/dashboard" icon={<BadgeDollarSign className="w-4 h-4" />} label="Dashboard" />
                            <SidebarLink href="/dashboard/finance" icon={<Receipt className="w-4 h-4" />} label="Extrato Financeiro" />
                            <SidebarLink href="/dashboard/reports/commissions" icon={<Wallet2 className="w-4 h-4" />} label="Comissões" />
                        </div>
                    </div>

                    {/* CLUBE DE ASSINATURA - Always accessible to allow payment? Usually yes. Keeping locked for stricter request "Bloquear dashboard" but maybe Subscription page should be open. The prompt lists specific areas to block.  */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 text-emerald-500">Clube de Assinatura</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/subscribers" icon={<Contact2 className="w-4 h-4" />} label="Assinantes" />
                            <SidebarLink href="/dashboard/subscriptions" icon={<CreditCard className="w-4 h-4" />} label="Planos" />
                        </div>
                    </div>
                </nav>

                {/* AJUSTES */}
                <div className="p-4 border-t border-slate-800/50">
                    <div className={`${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                        <SidebarLink href="/dashboard/whatsapp" icon={<Contact2 className="w-4 h-4" />} label="WhatsApp" />
                        <SidebarLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Configurações" />
                    </div>

                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500/60 hover:bg-red-500/10 transition-all mt-4">
                        <LogOut className="w-4 h-4" /> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                <header className="h-20 bg-[#111827] border-b border-slate-800/50 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4 md:hidden">
                        <button className="p-2 text-slate-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-black uppercase text-xl tracking-tighter text-white">
                            <span className="text-emerald-500 italic">Barbe</span>-On <span className="text-[8px] text-slate-600">v4.0</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 ml-auto">
                        {isLocked && (
                            <div className="bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Acesso Suspenso</span>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Bem-vindo,</p>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">{user?.name || 'Usuário'}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 md:p-12 overflow-x-hidden relative">
                    {isLocked ? (
                        <div className="absolute inset-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-sm flex items-center justify-center p-8">
                            <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LogOut className="w-10 h-10 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">Assinatura Inativa</h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    Sua assinatura está inativa ou vencida. Para continuar utilizando os recursos administrativos, por favor regularize seu plano.
                                </p>
                                <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                                    Regularizar Agora
                                </button>
                                <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
                                    Dúvidas? Entre em contato com o suporte.
                                </p>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}
