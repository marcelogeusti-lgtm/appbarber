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
        <div className="min-h-screen bg-[#0F111A] text-white p-4 md:p-8 space-y-6">

            {/* Header Section */}
            <div className="bg-[#151821] rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 font-bold text-xl">
                        {user.name?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                            OLÁ, {user.name?.toUpperCase()}! <Scissors className="w-6 h-6 text-pink-500" />
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Gestor Barber</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => refetch()}
                        title="Atualizar Dados"
                        className="p-3 bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl text-slate-400 hover:text-emerald-500 transition-all flex items-center justify-center group"
                    >
                        <RotateCw className={`w-4 h-4 group-active:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>

                    <Link
                        href="/search"
                        target="_blank"
                        className="px-6 py-3 bg-[#0F111A] border border-white/10 hover:border-emerald-500/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 group"
                    >
                        Acessar Marketplace
                        <ExternalLink className="w-3 h-3 group-hover:text-emerald-500" />
                    </Link>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Link Card */}
                <div className="bg-[#151821] rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-500 mb-6">
                        <UsersIcon />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Link de Agendamento Profissional</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0 bg-[#0F111A] rounded-xl border border-white/5 flex items-center px-4 py-3 relative group">
                            <span className="text-[10px] sm:text-xs text-emerald-500/50 truncate font-mono block w-full pr-8">
                                {publicUrl || 'https://...'}
                            </span>
                            <button onClick={copyToClipboard} className="absolute right-2 p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black px-6 py-4 sm:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-colors flex items-center justify-center sm:justify-start whitespace-nowrap"
                        >
                            Abrir Página
                        </a>
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 italic">
                        Este link é a porta de entrada para novos agendamentos 24h por dia.
                    </p>
                </div>

                {/* Today's Appointments Card */}
                <div className="bg-[#151821] rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Atendimentos Hoje</span>
                    <h2 className="text-6xl font-black text-white mb-4">{stats.appointments}</h2>
                    <div className="bg-emerald-900/30 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Atendimento Dinâmico
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historical Performance */}
                <div className="bg-[#151821] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden min-h-[180px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Performance Histórica</span>
                    <h3 className="text-4xl font-black text-white mb-1">
                        {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Faturamento Acumulado (Hoje)</p>

                    {/* Decorative Graph */}
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 79L30 50L60 60L100 20L149 1" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Community Metric */}
                <div className="bg-[#151821] rounded-[2rem] p-8 border border-white/5 min-h-[180px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nossa Comunidade</span>
                    <h3 className="text-4xl font-black text-white mb-1">{stats.clients}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clientes reais na sua base</p>
                </div>
            </div>

            {/* Premium Experience Banner */}
            <div className="bg-[#0A0C10] rounded-[2.5rem] p-8 md:p-12 border border-white/5 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase leading-tight">
                        A Experiência <span className="text-emerald-500">Premium</span> de Agendamento.
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mb-8 max-w-lg leading-relaxed">
                        O Barbe-On foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FeatureBox title="Simplicidade" desc="Acesso direto via QR Code ou Link Bio" />
                        <FeatureBox title="Agilidade" desc="Seleção de profissional em 3 toques" />
                        <FeatureBox title="Retenção" desc="Histórico e fidelidade automático" />
                    </div>
                </div>

                {/* Decorative Icon */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.03] text-white hidden lg:block pointer-events-none">
                    <ShoppingBag size={400} />
                </div>
            </div>

            {/* Onboarding / Actions Section */}
            <div className="rounded-[2.5rem] border border-white/5 border-dashed p-10 text-center relative bg-[#151821]/50">
                <h3 className="text-xl font-black text-white uppercase mb-2">Primeiros Passos...</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                    Configure seus serviços e comece a faturar hoje mesmo.
                </p>
                <Link
                    href="/dashboard/services"
                    className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black px-12 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                >
                    Cadastrar Meus Serviços
                </Link>
            </div>
        </div>
    );
}

function FeatureBox({ title, desc }) {
    return (
        <div className="bg-[#151821] border border-white/5 p-4 rounded-xl">
            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">{title}</h4>
            <p className="text-[10px] text-white font-bold leading-tight">{desc}</p>
        </div>
    );
}

function UsersIcon() {
    return (
        <div className="bg-emerald-500/10 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
    )
}
