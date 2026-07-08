'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, Calendar, Users, Scissors, Package, ScrollText,
    ShoppingBag, Receipt, DollarSign, PieChart, Wallet,
    Settings, MessageCircle, LogOut, ChevronDown, ChevronRight,
    Store, CreditCard, UserCheck, MessageSquare,
    PanelLeftClose, PanelLeftOpen, X, GraduationCap, Shield, Gift, Star, BarChart3,
    PlayCircle, Database, UploadCloud, Ticket, ListOrdered, Trophy, Boxes, ShieldX
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function Sidebar({ user, barbershop, isLocked, logout, isOpen, onClose }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [expandedGroups, setExpandedGroups] = useState({
        cadastros: true,
        financeiro: true,
        gestao: true,
        vendas: true,
        suporte: true,
        tutorial: true,
        config: false
    });

    const toggleGroup = (group) => {
        if (isCollapsed) return;
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const isActive = (path) => pathname === path;

    const queryClient = useQueryClient();

    const prefetchData = (href) => {
        if (!barbershop?.id) return;

        // Core Dashboard & Owner Charts
        if (href === '/dashboard' || href === '/dashboard/owner') {
            queryClient.prefetchQuery({
                queryKey: ['dashboard-stats', barbershop.id],
                queryFn: async () => {
                    const res = await api.get(`/dashboard/stats?barbershopId=${barbershop.id}`);
                    return res.data;
                }
            });
        }

        // Finance
        if (href === '/dashboard/finance') {
            queryClient.prefetchQuery({
                queryKey: ['finance-stats', barbershop.id, 'month'],
                queryFn: async () => {
                    const start = new Date();
                    start.setMonth(start.getMonth() - 1);
                    const res = await api.get(`/finance/stats?barbershopId=${barbershop.id}&startDate=${start.toISOString()}&endDate=${new Date().toISOString()}`);
                    return res.data;
                }
            });
        }



        // Cadastros
        if (href === '/dashboard/clients') {
            queryClient.prefetchQuery({
                queryKey: ['clients', barbershop.id],
                queryFn: async () => {
                    const res = await api.get(`/clients?barbershopId=${barbershop.id}&limit=50`);
                    return res.data;
                }
            });
        }

        if (href === '/dashboard/services') {
            queryClient.prefetchQuery({
                queryKey: ['services', barbershop.id],
                queryFn: async () => {
                    const res = await api.get(`/services?barbershopId=${barbershop.id}&active=true&limit=1000`);
                    return res.data;
                }
            });
        }
    };

    const MenuItem = ({ href, icon: Icon, label, badge }) => (
        <Link
            href={href}
            onClick={() => onClose && onClose()} // Close on mobile click
            onMouseEnter={() => prefetchData(href)}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${isActive(href)
                ? 'bg-primary/5 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            title={isCollapsed ? label : ''}
        >
            <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive(href) ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {label}
            </span>
            {badge && !isCollapsed && (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {badge}
                </span>
            )}
        </Link>
    );

    const MenuGroup = ({ title, id, icon: Icon, children }) => (
        <div className="mb-4">
            {!isCollapsed && (
                <button
                    onClick={() => toggleGroup(id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${expandedGroups[id] ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{title}</span>
                    </div>
                    {expandedGroups[id] ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronRight className="w-3 h-3 opacity-50" />}
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
                fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-border flex flex-col h-full transition-all duration-300 shadow-xl md:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:sticky md:top-0 md:h-screen
                ${isCollapsed ? 'md:w-16' : 'md:w-64'}
            `}>
                {/* Header */}
                <div className={`border-b border-border flex items-center transition-all duration-300 relative ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6 mb-2'}`}>
                    <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                        {!isCollapsed ? (
                            <img
                                src="/logos/logo_full.png"
                                alt="NEXT Logo"
                                className="h-8 object-contain w-auto transition-all duration-300"
                            />
                        ) : (
                            <img
                                src="/logos/logo_icon.png"
                                alt="Platform Icon"
                                className="w-8 h-8 object-contain transition-all duration-300"
                            />
                        )}
                    </div>

                    {/* Desktop Collapse Toggle - Border Positioned */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm z-50 ${isCollapsed ? 'rotate-180' : ''}`}
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden absolute right-4 text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>



                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                    {/* Principal */}
                    <div className="space-y-1">
                        <MenuItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.isMaster) && (
                            <MenuItem href="/dashboard/owner" icon={BarChart3} label="Análise" />
                        )}
                        <MenuItem href="/dashboard/schedule" icon={Calendar} label="Agenda" />
                        <MenuItem href="/dashboard/queue" icon={ListOrdered} label="Ordem de Chegada" badge="Novo" />
                    </div>

                    <div className="h-px bg-border mx-2 my-2"></div>

                    {/* Cadastros */}
                    <MenuGroup title="Cadastros" id="cadastros" icon={Users}>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST') && (
                            <MenuItem href="/dashboard/professionals" icon={UserCheck} label="Profissionais" />
                        )}
                        <MenuItem href="/dashboard/services" icon={Scissors} label="Serviços" />
                        <MenuItem href="/dashboard/products" icon={ShoppingBag} label="Produtos" />
                        <MenuItem href="/dashboard/clients" icon={Users} label="Clientes" />
                        <MenuItem href="/dashboard/restrictions" icon={ShieldX} label="Lista de Restrições" badge="Novo" />
                        <MenuItem href="/dashboard/registry" icon={Boxes} label="Cadastros de Apoio" badge="Novo" />
                    </MenuGroup>

                    {/* Comandas & Vendas */}
                    <MenuGroup title="Vendas" id="vendas" icon={Receipt}>
                        <MenuItem href="/dashboard/orders" icon={ScrollText} label="Comandas" />
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <>
                                <MenuItem href="/dashboard/subscriptions" icon={Package} label="Planos & Assinaturas" />
                                <MenuItem href="/dashboard/subscribers" icon={Users} label="Assinantes" />
                                <MenuItem href="/dashboard/loyalty" icon={Gift} label="Fidelidade" />
                                <MenuItem href="/dashboard/coupons" icon={Ticket} label="Cupons" badge="Novo" />
                            </>
                        )}
                        <MenuItem href="/dashboard/reviews" icon={Star} label="Avaliações" />
                    </MenuGroup>

                    {/* Conteúdo (Cursos) */}
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'BARBER' || user?.role === 'RECEPTIONIST') && (
                        <MenuGroup title="Educação" id="educacao" icon={GraduationCap}>
                            <MenuItem href="/dashboard/courses" icon={GraduationCap} label="Cursos" />
                        </MenuGroup>
                    )}

                    {/* Financeiro */}
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.isMaster) && (
                        <MenuGroup title="Financeiro" id="financeiro" icon={DollarSign}>
                            <MenuItem href="/dashboard/finance/dashboard" icon={PieChart} label="Dashboard" />
                            <MenuItem href="/dashboard/finance" icon={Wallet} label="Movimentações" />
                            <MenuItem href="/dashboard/accounts" icon={Receipt} label="Contas / Fiado" badge="Novo" />
                            <MenuItem href="/dashboard/reports/commissions" icon={DollarSign} label="Comissões" />
                            <MenuItem href="/dashboard/reports/rankings" icon={Trophy} label="Rankings" badge="Novo" />

                            <MenuItem href="/dashboard/finance/integrations" icon={CreditCard} label="Integrações" />
                        </MenuGroup>
                    )}

                    <div className="h-px bg-border mx-2 my-2"></div>

                    {/* Tutorial */}
                    <MenuGroup title="Tutorial" id="tutorial" icon={PlayCircle}>
                        <MenuItem href="/dashboard/tutorials" icon={PlayCircle} label="Vídeos Tutoriais" />
                    </MenuGroup>

                    {/* Configurações */}
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.isMaster) && (
                        <MenuGroup title="Configurações" id="config" icon={Settings}>
                            <MenuItem href="/dashboard/settings" icon={Settings} label="Ajustes do Sistema" />
                            <MenuItem href="/dashboard/import" icon={Database} label="Trazer meus dados" badge="Novo" />
                        </MenuGroup>
                    )}

                    {/* Master Management - PROTECTED SECTION: DO NOT REMOVE ROLE CHECKS */}
                    {(user?.role === 'SUPER_ADMIN' || user?.isMaster) && (
                        <>
                            <div className="h-px bg-primary/20 mx-2 my-2"></div>
                            <MenuGroup title="Gestão Master (Exclusivo)" id="master" icon={Shield}>
                                <MenuItem href="/dashboard/super-admin" icon={LayoutDashboard} label="Controle SaaS Global" badge="Master" />
                                <MenuItem href="/dashboard/super-admin/courses" icon={GraduationCap} label="Configurar Cursos" badge="Master" />
                                <MenuItem href="/dashboard/super-admin/tutorials" icon={PlayCircle} label="Gerenciar Tutoriais" badge="Master" />
                            </MenuGroup>
                        </>
                    )}

                </nav>

                {/* Footer / User Info */}
                <div className="p-3 border-t border-border bg-sidebar/50 backdrop-blur-sm">
                    {!isCollapsed ? (
                        <div className={`flex items-center gap-3 p-2 rounded-lg border border-border bg-card/50 ${isLocked ? 'opacity-50' : ''}`}>
                            {barbershop?.logo_url || barbershop?.logoUrl ? (
                                <img
                                    src={barbershop.logo_url || barbershop.logoUrl}
                                    alt={barbershop.commercialName || barbershop.name || 'Barbearia'}
                                    className="w-7 h-7 rounded-full object-cover border border-gray-100"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Scissors className="w-3.5 h-3.5" />
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    ) : (
                        barbershop?.logo_url || barbershop?.logoUrl ? (
                            <img
                                src={barbershop.logo_url || barbershop.logoUrl}
                                alt={barbershop.commercialName || barbershop.name || 'Barbearia'}
                                className="w-8 h-8 mx-auto rounded-full object-cover border border-primary/30"
                            />
                        ) : (
                            <div className="w-8 h-8 mx-auto rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                                <Scissors className="w-4 h-4" />
                            </div>
                        )
                    )}

                    <button
                        onClick={logout}
                        title="Sair"
                        className={`w-full mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-all ${isCollapsed ? 'px-0' : ''}`}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
