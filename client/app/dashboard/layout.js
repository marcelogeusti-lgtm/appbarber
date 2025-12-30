import { useEffect, useState } from 'react';
import {
    Calendar, History, PieChart, BadgeDollarSign, Users2,
    Contact2, Receipt, Clock3, UserPlus2, CreditCard,
    Wallet2, Settings, LogOut, Store, Menu
} from 'lucide-react';

function SidebarLink({ href, icon, label, active = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${active
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
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
        const token = localStorage.getItem('token');
        if (!token) router.push('/login');

        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#0a0f1a] text-slate-300 font-sans selection:bg-orange-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111827] border-r border-slate-800/50 hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <span className="text-orange-500 italic">Best</span>Barbers
                    </h2>

                    {/* Barbershop Status Selector */}
                    <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4 group cursor-pointer hover:border-orange-500/50 transition-all">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Unidade</p>
                            <h3 className="text-sm font-black text-white truncate uppercase tracking-tighter">{user.barbershop?.name || 'Barbearia'}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto pb-10">
                    {/* AGENDAMENTOS */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Agendamentos</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/schedule" icon={<Calendar className="w-4 h-4" />} label="Agenda" />
                            <SidebarLink href="/dashboard/history" icon={<History className="w-4 h-4" />} label="Histórico" />
                        </div>
                    </div>

                    {/* INDICADORES */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Indicadores</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/stats/occupancy" icon={<PieChart className="w-4 h-4" />} label="Taxa de Ocupação" />
                            <SidebarLink href="/dashboard/stats/ticket" icon={<BadgeDollarSign className="w-4 h-4" />} label="Ticket Médio" />
                            <SidebarLink href="/dashboard/stats/frequency" icon={<Users2 className="w-4 h-4" />} label="Frequência de Clientes" />
                        </div>
                    </div>

                    {/* CLUBE DE ASSINATURA */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 text-orange-500">Clube de Assinatura</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/subscribers" icon={<Contact2 className="w-4 h-4" />} label="Resumo de Assinantes" active />
                            <SidebarLink href="/dashboard/finance/receipts" icon={<Receipt className="w-4 h-4" />} label="Extrato de Recebimentos" />
                            <SidebarLink href="/dashboard/finance/upcoming" icon={<Clock3 className="w-4 h-4" />} label="Faturas Previstas" />
                            <SidebarLink href="/dashboard/subscriptions/new" icon={<UserPlus2 className="w-4 h-4" />} label="Cadastro de Assinaturas" />
                            <SidebarLink href="/dashboard/subscriptions" icon={<CreditCard className="w-4 h-4" />} label="Gestão de Planos" />
                            <SidebarLink href="/dashboard/finance/payouts" icon={<Wallet2 className="w-4 h-4" />} label="Saldo e Saque" />
                        </div>
                    </div>

                    {/* AJUSTES */}
                    <div className="pt-4 border-t border-slate-800/50">
                        <SidebarLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Configurações" />
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all mt-4">
                            <LogOut className="w-4 h-4" /> Sair do Sistema
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-20 bg-[#111827] border-b border-slate-800/50 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4 md:hidden">
                        <button className="p-2 text-slate-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-black uppercase text-xl tracking-tighter text-white">
                            <span className="text-orange-500 italic">Best</span>Barbers
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 ml-auto">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Bem-vindo,</p>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">{user.name}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">
                            {user.name?.[0]}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
