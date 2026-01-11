'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, Calendar, Users, Scissors, Package,
    ShoppingBag, Receipt, DollarSign, PieChart, Wallet,
    Settings, MessageCircle, LogOut, ChevronDown, ChevronRight,
    Store, CreditCard, UserCheck, ScrollText, MessageSquare,
    PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react';

export default function Sidebar({ user, isLocked, logout, isOpen, onClose }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // State to manage collapsed groups
    const [expandedGroups, setExpandedGroups] = useState({
        cadastros: true,
        financeiro: true,
        gestao: true,
        vendas: true,
        config: false
    });

    const toggleGroup = (group) => {
        if (isCollapsed) return;
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const isActive = (path) => pathname === path;

    const MenuItem = ({ href, icon: Icon, label, badge }) => (
        <Link
            href={href}
            onClick={() => onClose && onClose()} // Close on mobile click
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden whitespace-nowrap ${isActive(href)
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            title={isCollapsed ? label : ''}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(href) ? 'text-emerald-500' : 'text-slate-500 group-hover:text-white'}`} />
            <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {label}
            </span>
            {badge && !isCollapsed && (
                <span className="ml-auto bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {badge}
                </span>
            )}
        </Link>
    );

    const MenuGroup = ({ title, id, icon: Icon, children }) => (
        <div className="mb-2">
            {!isCollapsed && (
                <button
                    onClick={() => toggleGroup(id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${expandedGroups[id] ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        <span>{title}</span>
                    </div>
                    {expandedGroups[id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
            )}

            {/* If collapsed, just show children (simplified) or hide group header */}
            <div className={`space-y-1 mt-1 transition-all duration-300 ${isCollapsed || expandedGroups[id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                {children}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-[#0F111A] border-r border-white/5 flex flex-col h-full transition-all duration-300 shadow-2xl md:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:sticky md:top-0 md:h-screen
                ${isCollapsed ? 'md:w-20' : 'md:w-72'}
            `}>
                {/* Header */}
                <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Store className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white italic tracking-tight">Barbe<span className="text-emerald-500">On</span></h2>
                        </div>
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex text-slate-500 hover:text-white transition-colors">
                        {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                    {/* Principal */}
                    <div className="space-y-1">
                        <MenuItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
                        <MenuItem href="/dashboard/schedule" icon={Calendar} label="Agenda" />
                        <MenuItem href="/dashboard/crm" icon={MessageSquare} label="CRM" badge="Novo" />
                    </div>

                    <div className="h-px bg-white/5 mx-2 my-2"></div>

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

                    <div className="h-px bg-white/5 mx-2 my-2"></div>

                    {/* Configurações */}
                    <MenuGroup title="Configurações" id="config" icon={Settings}>
                        <MenuItem href="/dashboard/whatsapp" icon={MessageCircle} label="Integração WhatsApp" />
                        <MenuItem href="/dashboard/settings" icon={Settings} label="Ajustes do Sistema" />
                    </MenuGroup>

                </nav>

                {/* Footer / User Info */}
                <div className="p-4 border-t border-white/5 bg-[#0A0C10]">
                    {!isCollapsed ? (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#151821] ${isLocked ? 'opacity-50' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500 text-xs font-bold">
                                {user?.name?.[0]}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
                                <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500 text-xs font-bold">
                            {user?.name?.[0]}
                        </div>
                    )}

                    <button
                        onClick={logout}
                        title="Sair"
                        className={`w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-lg transition-all ${isCollapsed ? 'px-0' : ''}`}
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
