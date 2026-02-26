'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Copy, ExternalLink, Scissors, CheckCircle, ShoppingBag, ArrowRight, Calendar as CalendarIcon, TrendingUp, DollarSign, Globe, RotateCw
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [publicUrl, setPublicUrl] = useState('');

    // Initial User Setup & Fresh Data Fetch
    useEffect(() => {
        const fetchFreshData = async () => {
            const u = localStorage.getItem('user');
            if (u) {
                const parsedUser = JSON.parse(u);
                setUser(parsedUser);

                // Try to find slug from local first for immediate render
                const localSlug = parsedUser.barbershop?.slug || parsedUser.ownedBarbershops?.[0]?.slug || parsedUser.workedBarbershop?.slug;
                if (localSlug) {
                    const origin = window.location.origin;
                    setPublicUrl(`${origin}/${localSlug}`);
                }

                // FETCH FRESH DATA FROM BACKEND
                try {
                    const res = await api.get('/barbershops/me');
                    const freshShop = res.data;

                    // Update slug if changed
                    if (freshShop.slug) {
                        const origin = window.location.origin;
                        setPublicUrl(`${origin}/${freshShop.slug}`);
                    }

                    // Update User State with fresh shop name if needed (optional, but good for UI consistency)
                    // Note: We are not updating the 'user' object in localStorage here to avoid complexity, 
                    // but we could. For now, let's trust the 'stats' query and publicUrl.
                } catch (e) {
                    console.error('Failed to refresh barbershop data on dashboard', e);
                }
            }
        };
        fetchFreshData();
    }, []);

    // React Query for Stats
    const { data: stats = { revenue: 0, revenueTotal: 0, appointments: 0, clients: 0 }, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboardStats', user?.barbershopId],
        queryFn: async () => {
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            const res = await api.get(`/dashboard/stats?barbershopId=${bId}`);
            return {
                revenue: res.data.revenueToday || 0,
                revenueTotal: res.data.revenueTotal || 0,
                appointments: res.data.appointmentsToday || 0,
                clients: res.data.clientsTotal || 0,
                revenueTrend: res.data.revenueTrend
            };
        },
        // Enable only if we have a user
        enabled: !!user,
        staleTime: 30000,
    });

    if (!user || isLoading) return <DashboardSkeleton />;
    if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

    const copyToClipboard = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        alert('Link copiado!');
    };

    return (
        <div className="bg-background text-foreground space-y-6">

            {/* Header Section */}
            <div className="bg-card rounded-xl p-6 border border-border flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                        {user.name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            Olá, {user.name} <Scissors className="w-5 h-5 text-primary" />
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Gestor Barber</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        title="Atualizar Dados"
                        className="h-9 w-9 bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg text-muted-foreground hover:text-primary transition-all flex items-center justify-center group"
                    >
                        <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                    </button>

                    <Link
                        href="/search"
                        target="_blank"
                        className="h-9 px-4 bg-card border border-border hover:border-primary/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 group"
                    >
                        Marketplace
                        <ExternalLink className="w-3 h-3 group-hover:text-primary" />
                    </Link>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Link Card */}
                <div className="bg-card rounded-xl p-6 border border-border flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <UsersIcon />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link de Agendamento Profissional</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0 bg-muted rounded-lg border border-border flex items-center px-3 py-2 relative group">
                            <span className="text-xs text-slate-500 truncate font-mono block w-full pr-8">
                                {publicUrl || 'https://...'}
                            </span>
                            <button onClick={copyToClipboard} className="absolute right-1.5 p-1.5 hover:bg-card rounded-md text-muted-foreground hover:text-foreground transition-colors">
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white px-5 h-9 rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center whitespace-nowrap"
                        >
                            Abrir Página
                        </a>
                    </div>
                </div>

                {/* Today's Appointments Card */}
                <div className="bg-card rounded-xl p-6 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Atendimentos Hoje</span>
                    <h2 className="text-5xl font-bold text-foreground mb-2">{stats.appointments}</h2>
                    <div className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Atendimento Dinâmico
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historical Performance */}
                <div className="bg-card rounded-xl p-6 border border-border relative overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Performance Histórica</span>
                    <h3 className="text-3xl font-bold text-foreground mb-1">
                        {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Faturamento Hoje</p>
                </div>

                {/* Community Metric */}
                <div className="bg-card rounded-xl p-6 border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Nossa Comunidade</span>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{stats.clients}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Clientes Cadastrados</p>
                </div>
            </div>

            {/* Premium Experience Banner */}
            <div className="bg-card rounded-xl p-8 border border-border relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-xl font-bold text-foreground mb-3 uppercase tracking-tight">
                        A Experiência <span className="text-primary">Premium</span> de Agendamento.
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-lg leading-relaxed">
                        O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FeatureBox title="Simplicidade" desc="Acesso via QR Code ou Link" />
                        <FeatureBox title="Agilidade" desc="Agendamento em 3 toques" />
                        <FeatureBox title="Retenção" desc="Fidelização automática" />
                    </div>
                </div>

                {/* Decorative Icon */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.03] text-white hidden lg:block pointer-events-none">
                    <ShoppingBag size={400} />
                </div>
            </div>

            {/* Onboarding / Actions Section */}
            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/30">
                <h3 className="text-lg font-bold text-foreground mb-2">Primeiros Passos...</h3>
                <p className="text-xs text-muted-foreground font-medium mb-6">
                    Configure seus serviços e comece a faturar hoje mesmo.
                </p>
                <Link
                    href="/dashboard/services"
                    className="inline-flex h-10 px-8 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm items-center justify-center"
                >
                    Cadastrar Meus Serviços
                </Link>
            </div>
        </div>
    );
}

function FeatureBox({ title, desc }) {
    return (
        <div className="bg-card border border-border p-4 rounded-xl">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{title}</h4>
            <p className="text-[10px] text-foreground font-bold leading-tight">{desc}</p>
        </div>
    );
}

function UsersIcon() {
    return (
        <div className="bg-primary/10 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
    )
}
