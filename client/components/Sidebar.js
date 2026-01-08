'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, Calendar, Users, Scissors, Package,
    ShoppingBag, Receipt, DollarSign, PieChart, Wallet,
    Settings, MessageCircle, LogOut, ChevronDown, ChevronRight,
    Store, CreditCard, UserCheck, ScrollText
} from 'lucide-react';

export default function Sidebar({ user, isLocked, logout }) {
    const pathname = usePathname();
    // State to manage collapsed groups
    const [expandedGroups, setExpandedGroups] = useState({
        cadastros: true,
        financeiro: true,
        gestao: true,
        config: false
    });

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const isActive = (path) => pathname === path;
    const isGroupActive = (paths) => paths.some(path => pathname.startsWith(path));

    const MenuItem = ({ href, icon: Icon, label, badge }) => (
        <Link
            href={href}
            className={`group flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive(href)
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive(href) ? 'text-emerald-500' : 'text-slate-500 group-hover:text-white'}`} />
                <span>{label}</span>
            </div>
            {badge && (
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {badge}
                </span>
            )}
        </Link>
    );

    const MenuGroup = ({ title, id, icon: Icon, children }) => (
        <div className="mb-2">
            <button
                onClick={() => toggleGroup(id)}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${expandedGroups[id] ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{title}</span>
                </div>
                {expandedGroups[id] ? (
                    <ChevronDown className="w-3 h-3 opacity-50" />
                ) : (
                    <ChevronRight className="w-3 h-3 opacity-50" />
                )}
            </button>
            <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${expandedGroups[id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                {children}
            </div>
        </div>
    );

    return (
        <aside className="w-72 bg-[#111827] border-r border-slate-800/50 hidden md:flex flex-col h-screen sticky top-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white italic tracking-tight">Barbe<span className="text-emerald-500">On</span></h2>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Gestão Premium</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                {/* Principal */}
                <div className="space-y-1">
                    <MenuItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
                    <MenuItem href="/dashboard/schedule" icon={Calendar} label="Agenda" />
                </div>

                {/* Cadastros */}
                <MenuGroup title="Cadastros" id="cadastros" icon={Users}>
                    <MenuItem href="/dashboard/professionals" icon={UserCheck} label="Profissionais" />
                    <MenuItem href="/dashboard/services" icon={Scissors} label="Serviços" />
                    <MenuItem href="/dashboard/products" icon={ShoppingBag} label="Produtos" />
                    <MenuItem href="/dashboard/clients" icon={Users} label="Clientes" />
                </MenuGroup>

                {/* Comandas & Vendas */}
                <MenuGroup title="Vendas" id="vendas" icon={Receipt}>
                    <MenuItem href="/dashboard/orders" icon={ScrollText} label="Comandas" />
                    <MenuItem href="/dashboard/subscriptions" icon={Package} label="Planos & Assinaturas" />
                    <MenuItem href="/dashboard/subscribers" icon={Users} label="Assinantes" />
                </MenuGroup>

                {/* Financeiro */}
                <MenuGroup title="Financeiro" id="financeiro" icon={DollarSign}>
                    <MenuItem href="/dashboard/finance/dashboard" icon={PieChart} label="Dashboard" />
                    <MenuItem href="/dashboard/finance" icon={Wallet} label="Movimentações" />
                    <MenuItem href="/dashboard/reports/commissions" icon={DollarSign} label="Comissões" />
                </MenuGroup>

                {/* Configurações */}
                <MenuGroup title="Configurações" id="config" icon={Settings}>
                    <MenuItem href="/dashboard/whatsapp" icon={MessageCircle} label="Integração WhatsApp" />
                    <MenuItem href="/dashboard/settings" icon={Settings} label="Ajustes do Sistema" />
                </MenuGroup>

            </nav>

            {/* Footer / User Info */}
            <div className="p-4 border-t border-slate-800/50 bg-[#0f1523]">
                <div className={`flex items-center gap-3 p-3 rounded-xl border border-slate-800/50 bg-slate-900/50 ${isLocked ? 'opacity-50' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <span className="text-sm font-bold text-slate-300">{user?.name?.[0]}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
}
