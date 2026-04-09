'use client';
import { useQuery } from '@tanstack/react-query';
import {
    Copy, ExternalLink, Scissors, CheckCircle, ShoppingBag, ArrowRight, Calendar as CalendarIcon, TrendingUp, DollarSign, Globe, RotateCw, Users as UsersIcon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { safeGetItem } from '../../lib/storage';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [publicUrl, setPublicUrl] = useState('');

    const getUser = () => {
        if (typeof window === 'undefined') return null;
        return safeGetItem('user', true);
    };

    const user = getUser();
    const bId = user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id;

    // Fetch Fresh Barbershop Data (including slug)
    const { data: barbershop } = useQuery({
        queryKey: ['barbershop-me', bId],
        queryFn: async () => {
            const res = await api.get('/barbershops/me');
            return res.data;
        },
        enabled: !!bId,
    });

    useEffect(() => {
        if (barbershop?.slug) {
            setPublicUrl(`${window.location.origin}/${barbershop.slug}`);
        } else if (user?.barbershop?.slug) {
            setPublicUrl(`${window.location.origin}/${user.barbershop.slug}`);
        }
    }, [barbershop, user]);

    // React Query for Stats
    const { data: stats, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboardStats', bId],
        queryFn: async () => {
            const res = await api.get(`/dashboard/stats?barbershopId=${bId}`);
            return {
                revenueToday: res.data.revenueToday || 0,
                appointmentsToday: res.data.appointmentsToday || 0,
                clientsTotal: res.data.clientsTotal || 0,
                openCommands: res.data.openCommands || 0
            };
        },
        enabled: !!bId,
        staleTime: 30000,
    });

    if (!user || isLoading) return <DashboardSkeleton />;
    if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

    const copyToClipboard = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        alert('Link copiado!');
    };

    const shopName = barbershop?.commercialName || barbershop?.name || user?.barbershop?.name || user?.name;

    return (
        <div className="bg-background text-foreground space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-card rounded-xl p-6 border border-border flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                        {shopName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 uppercase tracking-tighter">
                            Olá, {shopName}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Gestão Ativa</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="h-9 w-9 bg-card border border-border hover:border-primary/50 rounded-lg text-muted-foreground hover:text-primary transition-all flex items-center justify-center"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/search"
                        target="_blank"
                        className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
                    >
                        Marketplace <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Faturamento Hoje" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.revenueToday)} icon={DollarSign} />
                <StatCard title="Agendamentos" value={stats?.appointmentsToday} icon={CalendarIcon} />
                <StatCard title="Clientes" value={stats?.clientsTotal} icon={UsersIcon} />
                <StatCard title="Comandas Abertas" value={stats?.openCommands} icon={ShoppingBag} color="text-amber-500" />
            </div>

            {/* Link & Marketing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-xl p-8 border border-border space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Seu Link de Agendamento</h3>
                        <p className="text-sm text-muted-foreground mb-4">Compartilhe este link em seu Instagram e WhatsApp para receber agendamentos automáticos.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-muted rounded-xl border border-border px-4 py-3 flex items-center relative group">
                            <span className="text-xs font-mono text-slate-500 truncate mr-8">{publicUrl || 'Carregando...'}</span>
                            <button onClick={copyToClipboard} className="absolute right-2 p-2 hover:bg-card rounded-lg text-muted-foreground hover:text-primary"><Copy className="w-4 h-4" /></button>
                        </div>
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="bg-slate-900 border border-slate-800 text-white px-6 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest">Abrir</a>
                    </div>
                </div>

                <div className="bg-primary p-8 rounded-xl text-primary-foreground flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-2">Aprenda o <br/>Sistema</h3>
                        <p className="text-xs opacity-70 font-medium">Veja como configurar e usar todas as funções passo a passo</p>
                    </div>
                    <Link href="/dashboard/tutorials" className="relative z-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white w-full py-3 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all mt-6 text-center">
                        Começar agora
                    </Link>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <TrendingUp size={160} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <ActionBox icon={Scissors} title="Gerenciar Serviços" desc="Adicione novos cortes, barbas e tratamentos." href="/dashboard/services" />
                <ActionBox icon={CheckCircle} title="Ajustes Gerais" desc="Configure as informações e preferências da sua barbearia." href="/dashboard/settings?tab=Geral" />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color = "text-primary" }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-muted border border-border group-hover:border-primary/20`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{value}</h4>
        </div>
    );
}

function ActionBox({ icon: Icon, title, desc, href }) {
    return (
        <Link href={href} className="flex items-center gap-5 p-6 bg-card border border-border rounded-xl hover:border-primary/40 group transition-all">
            <div className="p-4 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-sm font-black uppercase text-foreground mb-0.5">{title}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="ml-auto w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
        </Link>
    );
}
