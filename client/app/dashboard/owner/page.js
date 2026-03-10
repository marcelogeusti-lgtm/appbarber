'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    TrendingUp, Users, Scissors, DollarSign, Calendar,
    ArrowUpRight, Target, UserPlus, Zap, BarChart3,
    ChevronRight, Star, Clock, Trophy, Award
} from 'lucide-react';

export default function OwnerDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchOwnerData();
    }, []);

    const fetchOwnerData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setLoading(false);
                return;
            }
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!bId) {
                console.warn('No barbershopId found for analysis report');
                setLoading(false);
                return;
            }

            const res = await api.get(`/finance/owner-report?barbershopId=${bId}&startDate=${startDate}&endDate=${endDate}`);
            setData(res.data || null);
            setLoading(false);
        } catch (err) {
            console.error('Fetch Owner Data Error:', err);
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse uppercase font-black tracking-widest text-xs">Acessando inteligência de negócio...</div>;
    }

    const { kpis, rankings, charts } = data;

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-10 pb-24">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Análise Estratégica</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Gestão de Negócio</h1>
                    <p className="text-muted-foreground text-sm font-medium italic mt-2">Visão estratégica para maximizar lucros e crescimento.</p>
                </div>

                <div className="flex gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2"
                    />
                    <div className="w-px h-4 bg-border self-center" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2"
                    />
                    <button onClick={fetchOwnerData} className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity">
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* --- INTELLIGENCE ALERTS --- */}
            {data.alerts && data.alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.alerts.map((alert, i) => (
                        <div key={i} className={`p-5 rounded-2xl border-l-4 shadow-sm flex gap-4 items-start ${alert.type === 'DANGER' ? 'bg-red-500/5 border-red-500 text-red-500' :
                            alert.type === 'WARNING' ? 'bg-yellow-500/5 border-yellow-500 text-yellow-500' :
                                'bg-blue-500/5 border-blue-500 text-blue-500'
                            }`}>
                            <div className="p-2 rounded-xl bg-background/50">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">{alert.title}</p>
                                <p className="text-sm font-bold mt-1 text-foreground leading-snug">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MAIN KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ManagementCard
                    label="Ticket Médio"
                    value={formatBRL(kpis.ticketMedio)}
                    desc="Gasto médio por cliente"
                    icon={Target}
                    trend="+12%"
                />
                <ManagementCard
                    label="Taxa de Retenção"
                    value={`${kpis.retentionRate.toFixed(1)}%`}
                    desc="Clientes que voltaram"
                    icon={UserPlus}
                    trend="+5%"
                />
                <ManagementCard
                    label="Previsão (30d)"
                    value={formatBRL(kpis.forecast)}
                    desc="Receita já agendada"
                    icon={Calendar}
                    color="primary"
                />
                <ManagementCard
                    label="Lucro "
                    value={formatBRL(kpis.estimatedProfit)}
                    desc="Resultado líquido do shop"
                    icon={Zap}
                    color="secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- PROFIT PER BARBER --- */}
                <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border shadow-soft relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="w-32 h-32" />
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-8 flex items-center gap-3">
                        <Award className="w-6 h-6 text-primary" /> Ranking por Lucro Gerado
                    </h3>
                    <div className="space-y-6">
                        {rankings.professionals.map((pro, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all hover:translate-x-1 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center font-black text-primary border border-border shadow-sm">
                                        {i + 1}º
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest text-foreground">{pro.name}</p>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Bruto: {formatBRL(pro.revenue)}</p>
                                            <p className="text-[9px] font-bold text-destructive uppercase tracking-widest">Comissão: {formatBRL(pro.commission)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary uppercase">{formatBRL(pro.net)}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Líquido para Casa</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TOP SERVICES --- */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-soft">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-8">Serviços Estrela</h3>
                    <div className="space-y-4">
                        {rankings.services.slice(0, 5).map((s, i) => (
                            <div key={i} className="p-4 bg-background rounded-2xl border border-border flex justify-between items-center group hover:border-primary transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.name}</p>
                                    <p className="text-sm font-black text-foreground">{s.count} Vendas</p>
                                </div>
                                <p className="text-lg font-black text-primary">{formatBRL(s.revenue)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-border">
                        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                            <Zap className="w-6 h-6 text-primary animate-pulse" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Insight Inteligente</p>
                                <p className="text-[10px] font-bold text-foreground mt-1">O serviço "{rankings.services[0]?.name}" representa {((rankings.services[0]?.revenue / kpis.monthlyRevenue) * 100).toFixed(0)}% do seu faturamento.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- HOURLY HEATMAP --- */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-soft">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-8 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" /> Horários Nobres (Receita)
                    </h3>
                    <div className="flex items-end gap-1.5 h-48 pt-10 px-2">
                        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => {
                            const val = charts.hourlyHeatmap.find(x => x.hour === h)?.value || 0;
                            const max = Math.max(...charts.hourlyHeatmap.map(x => x.value)) || 1;
                            const height = (val / max) * 100;
                            return (
                                <div key={h} className="flex-1 flex flex-col items-center group h-full justify-end">
                                    <div
                                        className="w-full rounded-t-lg bg-primary/20 group-hover:bg-primary transition-all relative overflow-hidden"
                                        style={{ height: `${Math.max(10, height)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                    <p className="text-[8px] font-bold text-muted-foreground mt-3 uppercase tracking-tighter opacity-60 group-hover:opacity-100">{h}h</p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest mt-6 italic">A barra mais alta indica o horário de maior faturamento.</p>
                </div>

                {/* --- VIP CLIENTS --- */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-soft">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-8">Clientes VIP (Top 5)</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {rankings.clients.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border group hover:border-yellow-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-muted text-muted-foreground'}`}>
                                        {i === 0 ? <Star className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <p className="font-black text-xs uppercase tracking-widest text-foreground">{c.name}</p>
                                </div>
                                <p className="font-black text-foreground uppercase">{formatBRL(c.amount)}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-4 border border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary transition-all">
                        Ver Lista Completa de Clientes
                    </button>
                </div>
            </div>
        </div>
    );
}

function ManagementCard({ label, value, desc, icon: Icon, color = 'muted', trend }) {
    const colors = {
        primary: 'bg-primary border-primary/20 text-primary-foreground shadow-xl shadow-primary/20',
        secondary: 'bg-secondary border-secondary/20 text-secondary-foreground shadow-xl shadow-secondary/20',
        muted: 'bg-card border-border text-foreground',
    };

    return (
        <div className={`p-8 rounded-[2rem] border transition-all hover:scale-[1.02] cursor-default ${colors[color]}`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${color === 'muted' ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 bg-green-500/20 text-green-500 px-2.5 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-[10px] font-black">{trend}</span>
                    </div>
                )}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${color === 'muted' ? 'text-muted-foreground' : 'text-white/60'}`}>{label}</p>
            <p className="text-4xl font-black tracking-tighter mb-4 leading-none uppercase">{value}</p>
            <p className={`text-[10px] font-medium italic ${color === 'muted' ? 'text-muted-foreground/60' : 'text-white/40'}`}>{desc}</p>
        </div>
    );
}
