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

    return (
        <div className="flex min-h-screen bg-[#0a0f1a] text-slate-300 font-sans selection:bg-emerald-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111827] border-r border-slate-800/50 hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <span className="text-emerald-500 italic">Barbe</span>-On
                    </h2>

                    {/* Barbershop Status Selector */}
                    <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4 group cursor-pointer hover:border-emerald-500/50 transition-all">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Unidade</p>
                            <h3 className="text-sm font-black text-white truncate uppercase tracking-tighter">{user?.barbershop?.name || 'Barbearia'}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto pb-10">
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

                    {/* CLUBE DE ASSINATURA */}
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 text-emerald-500">Clube de Assinatura</p>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard/subscribers" icon={<Contact2 className="w-4 h-4" />} label="Assinantes" />
                            <SidebarLink href="/dashboard/subscriptions" icon={<CreditCard className="w-4 h-4" />} label="Planos" />
                        </div>
                    </div>

                    {/* AJUSTES */}
                    <div className="pt-4 border-t border-slate-800/50">
                        <SidebarLink href="/dashboard/whatsapp" icon={<Contact2 className="w-4 h-4" />} label="WhatsApp" />
                        <SidebarLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Configurações" />
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500/60 hover:bg-red-500/10 transition-all mt-4">
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
                            <span className="text-emerald-500 italic">Barbe</span>-On
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 ml-auto">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Bem-vindo,</p>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">{user?.name || 'Usuário'}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
                            {user?.name?.[0] || 'U'}
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
