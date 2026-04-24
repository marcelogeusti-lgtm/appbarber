'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Calendar, ArrowUpRight, Target, UserPlus, Zap, BarChart3,
    Star, Clock, Trophy, Award, BrainCircuit, TrendingUp, 
    ChevronRight, Sparkles, AlertCircle, Info, Filter, 
    ArrowDownRight, Users, Scissors, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OwnerDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchOwnerData();
    }, []);

    const fetchOwnerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('Usuário não autenticado.');
                setLoading(false);
                return;
            }
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!bId) {
                setError('Nenhuma barbearia encontrada para este usuário.');
                setLoading(false);
                return;
            }

            const res = await api.get(`/finance/owner-report?barbershopId=${bId}&startDate=${startDate}&endDate=${endDate}`);
            setData(res.data || null);
        } catch (err) {
            console.error('Fetch Owner Data Error:', err);
            setError(err.response?.data?.message || 'Erro ao carregar dados de análise.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <BrainCircuit className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Acessando Inteligência NEXT...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-6 text-center bg-card/30 backdrop-blur-xl rounded-[3rem] border border-border/50">
                <div className="w-20 h-20 bg-muted/20 rounded-[2rem] flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Análise não disponível</h2>
                    <p className="text-muted-foreground text-sm max-w-sm font-medium">{error || 'Sem dados suficientes para gerar insights agora.'}</p>
                </div>
                <button onClick={fetchOwnerData} className="px-10 py-4 bg-primary text-white font-black text-[11px] rounded-2xl hover:scale-105 transition-all uppercase tracking-widest shadow-xl shadow-primary/20">
                    Sincronizar Agora
                </button>
            </div>
        );
    }

    const { kpis, rankings, charts, alerts } = data;
    const professionals = rankings?.professionals || [];
    const services = rankings?.services || [];
    const clients = rankings?.clients || [];
    const hourlyHeatmap = charts?.hourlyHeatmap || [];

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700">
            {/* --- HEADER PREMIUM --- */}
            <header className="relative overflow-hidden bg-card/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-border/50 shadow-2xl group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-64 transition-all duration-1000 group-hover:bg-primary/20"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Next Intelligence v2.0</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">Gestão de <br/><span className="text-primary">Negócio</span></h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex items-center bg-background/50 p-2 rounded-2xl border border-border shadow-inner backdrop-blur-xl">
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none px-4 text-foreground w-full sm:w-auto"
                            />
                            <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none px-4 text-foreground w-full sm:w-auto"
                            />
                            <button onClick={fetchOwnerData} className="ml-2 bg-primary text-white p-3 rounded-xl hover:scale-110 transition-all shadow-lg shadow-primary/20">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- AI INSIGHTS HUB --- */}
            <AnimatePresence>
                {alerts && alerts.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {alerts.map((alert, i) => (
                            <div key={i} className={`relative overflow-hidden p-8 rounded-[2.5rem] border backdrop-blur-xl group transition-all hover:translate-y-[-4px] ${
                                alert.type === 'DANGER' ? 'bg-red-500/10 border-red-500/30' :
                                alert.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30' :
                                'bg-blue-500/10 border-blue-500/30'
                            }`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="w-20 h-20" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        alert.type === 'DANGER' ? 'bg-red-500 text-white' :
                                        alert.type === 'WARNING' ? 'bg-amber-500 text-white' :
                                        'bg-blue-500 text-white'
                                    }`}>
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">{alert.title}</h4>
                                </div>
                                <p className="text-lg font-bold leading-tight text-foreground/90">{alert.message}</p>
                                <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                                    Aplicar Estratégia <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- KPI MATRIX --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ticket Médio', value: formatBRL(kpis.ticketMedio), icon: Target, desc: 'Faturamento por cliente' },
                    { label: 'Retenção', value: `${kpis.retentionRate.toFixed(1)}%`, icon: Users, desc: 'Fidelidade da base' },
                    { label: 'Previsão 30d', value: formatBRL(kpis.forecast), icon: Calendar, desc: 'Receita já garantida', highlight: true },
                    { label: 'Lucro Líquido', value: formatBRL(kpis.estimatedProfit), icon: TrendingUp, desc: 'Sobra real no bolso', success: true }
                ].map((kpi, idx) => (
                    <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl ${
                        kpi.highlight ? 'bg-primary border-primary text-white shadow-primary/20' : 
                        kpi.success ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-green-500/5' : 
                        'bg-card border-border/50 text-foreground'
                    }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${kpi.highlight ? 'bg-white/20' : 'bg-muted/50 text-muted-foreground'}`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${kpi.highlight ? 'opacity-70' : 'text-muted-foreground'}`}>{kpi.label}</p>
                        <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">{kpi.value}</h2>
                        <p className={`text-[10px] font-medium ${kpi.highlight ? 'opacity-50' : 'text-muted-foreground/60'}`}>{kpi.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- TEAM RANKING --- */}
                <div className="lg:col-span-2 bg-card p-10 rounded-[3rem] border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-primary" /> Performance por Profissional
                        </h3>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                            Top Performers
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {professionals.map((pro, i) => (
                            <div key={i} className="group/item flex items-center justify-between p-6 bg-muted/20 hover:bg-muted/40 rounded-3xl border border-border/50 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all group-hover/item:scale-110 ${
                                        i === 0 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 
                                        i === 1 ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg uppercase tracking-tight">{pro.name}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Revenue: {formatBRL(pro.revenue)}</span>
                                            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                                            <span className="text-[10px] text-destructive font-bold uppercase tracking-widest">Comissão: {formatBRL(pro.commission)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary tracking-tighter">{formatBRL(pro.net)}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Lucro Líquido</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- HEATMAP & SERVICES --- */}
                <div className="space-y-8">
                    {/* Heatmap Vertical */}
                    <div className="bg-card p-10 rounded-[3rem] border border-border/50 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-primary" /> Fluxo por Horário
                        </h3>
                        <div className="flex items-end justify-between h-40 gap-2 px-2">
                            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => {
                                const val = hourlyHeatmap.find(x => x.hour === h)?.value || 0;
                                const max = Math.max(...hourlyHeatmap.map(x => x.value), 1);
                                const height = (val / max) * 100;
                                return (
                                    <div key={h} className="flex-1 flex flex-col items-center group h-full justify-end">
                                        <div 
                                            className={`w-full rounded-full transition-all duration-700 ${val > 0 ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted/50'}`}
                                            style={{ height: `${Math.max(10, height)}%` }}
                                        ></div>
                                        <p className="text-[8px] font-black text-muted-foreground mt-3 uppercase">{h}h</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Insight Service */}
                    <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mb-10 -mr-10 group-hover:bg-white/20 transition-all"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">Principal Serviço</h3>
                        {services[0] ? (
                            <>
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{services[0].name}</h4>
                                <p className="text-sm font-medium opacity-80 mb-6">{services[0].count} agendamentos no período</p>
                                <div className="flex items-center justify-between border-t border-white/20 pt-6">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Faturamento</p>
                                        <p className="text-xl font-black tracking-tight">{formatBRL(services[0].revenue)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Scissors className="w-6 h-6" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm opacity-60">Sem dados no momento</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

