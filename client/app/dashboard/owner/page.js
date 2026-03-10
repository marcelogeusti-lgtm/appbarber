'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Calendar, ArrowUpRight, Target, UserPlus, Zap, BarChart3,
    Star, Clock, Trophy, Award
} from 'lucide-react';

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
        return <div className="p-8 text-center text-muted-foreground animate-pulse uppercase font-bold tracking-widest text-xs">Acessando inteligência de negócio...</div>;
    }

    if (error || !data) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                <h2 className="text-lg font-bold text-foreground">Análise Indisponível</h2>
                <p className="text-sm text-muted-foreground max-w-sm">{error || 'Nenhum dado encontrado para o período selecionado.'}</p>
                <button onClick={fetchOwnerData} className="mt-2 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const { kpis, rankings, charts } = data;
    const professionals = rankings?.professionals || [];
    const services = rankings?.services || [];
    const clients = rankings?.clients || [];
    const hourlyHeatmap = charts?.hourlyHeatmap || [];

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6 pb-12">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-border">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Análise Estratégica</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Negócio</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Visão estratégica para maximizar lucros e crescimento.</p>
                </div>

                <div className="flex gap-2 bg-background p-1.5 rounded-lg border border-border">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium outline-none px-2 text-foreground"
                    />
                    <div className="w-px bg-border self-stretch" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium outline-none px-2 text-foreground"
                    />
                    <button onClick={fetchOwnerData} className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90 transition-opacity">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* --- INTELLIGENCE ALERTS --- */}
            {data.alerts && data.alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.alerts.map((alert, i) => (
                        <div key={i} className={`p-4 rounded-xl border-l-4 flex gap-3 items-start ${alert.type === 'DANGER' ? 'bg-red-500/5 border-red-500 text-red-500' :
                            alert.type === 'WARNING' ? 'bg-yellow-500/5 border-yellow-500 text-yellow-500' :
                                'bg-blue-500/5 border-blue-500 text-blue-500'
                            }`}>
                            <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider">{alert.title}</p>
                                <p className="text-sm font-medium mt-0.5 text-foreground leading-snug">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MAIN KPIs --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ManagementCard label="Ticket Médio" value={formatBRL(kpis.ticketMedio)} desc="Gasto médio por cliente" icon={Target} trend="+12%" />
                <ManagementCard label="Taxa de Retenção" value={`${kpis.retentionRate.toFixed(1)}%`} desc="Clientes que voltaram" icon={UserPlus} trend="+5%" />
                <ManagementCard label="Previsão (30d)" value={formatBRL(kpis.forecast)} desc="Receita já agendada" icon={Calendar} color="primary" />
                <ManagementCard label="Lucro" value={formatBRL(kpis.estimatedProfit)} desc="Resultado líquido" icon={Zap} color="secondary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- PROFIT PER BARBER --- */}
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <Trophy className="w-32 h-32" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" /> Ranking por Lucro Gerado
                    </h3>
                    <div className="space-y-3">
                        {professionals.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 italic">Nenhum profissional com faturamento no período.</p>
                        ) : professionals.map((pro, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center font-bold text-primary border border-border text-xs">
                                        {i + 1}º
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{pro.name}</p>
                                        <div className="flex gap-3 mt-0.5">
                                            <p className="text-[10px] text-muted-foreground">Bruto: {formatBRL(pro.revenue)}</p>
                                            <p className="text-[10px] text-destructive">Comissão: {formatBRL(pro.commission)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary">{formatBRL(pro.net)}</p>
                                    <p className="text-[10px] text-muted-foreground">Líquido</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TOP SERVICES --- */}
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">Serviços em Destaque</h3>
                    <div className="space-y-2">
                        {services.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 italic">Nenhum serviço no período.</p>
                        ) : services.slice(0, 5).map((s, i) => (
                            <div key={i} className="p-3 bg-muted/20 rounded-xl border border-border flex justify-between items-center hover:border-primary/30 transition-all">
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{s.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} vendas</p>
                                </div>
                                <p className="text-sm font-bold text-primary">{formatBRL(s.revenue)}</p>
                            </div>
                        ))}
                    </div>
                    {services.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-start gap-2">
                                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-foreground leading-relaxed">
                                    <span className="font-semibold text-primary">Insight:</span> &quot;{services[0]?.name}&quot; representa {((services[0]?.revenue / kpis.monthlyRevenue) * 100).toFixed(0)}% do faturamento.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- HOURLY HEATMAP --- */}
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Horários com Maior Receita
                    </h3>
                    <div className="flex items-end gap-1.5 h-36 px-1">
                        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => {
                            const val = hourlyHeatmap.find(x => x.hour === h)?.value || 0;
                            const max = Math.max(...hourlyHeatmap.map(x => x.value), 1);
                            const height = (val / max) * 100;
                            return (
                                <div key={h} className="flex-1 flex flex-col items-center group h-full justify-end">
                                    <div
                                        className="w-full rounded-t-sm bg-primary/20 group-hover:bg-primary transition-all"
                                        style={{ height: `${Math.max(8, height)}%` }}
                                    />
                                    <p className="text-[8px] text-muted-foreground mt-1.5 opacity-60 group-hover:opacity-100">{h}h</p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-3 italic">A barra mais alta indica o horário de maior faturamento.</p>
                </div>

                {/* --- VIP CLIENTS --- */}
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">Clientes VIP (Top 5)</h3>
                    <div className="space-y-2">
                        {clients.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 italic">Nenhum cliente com pedido fechado no período.</p>
                        ) : clients.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-transparent hover:border-yellow-500/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {i === 0 ? <Star className="w-3.5 h-3.5" /> : i + 1}
                                    </div>
                                    <p className="font-medium text-sm text-foreground">{c.name}</p>
                                </div>
                                <p className="font-bold text-sm text-foreground">{formatBRL(c.amount)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ManagementCard({ label, value, desc, icon: Icon, color = 'muted', trend }) {
    const colors = {
        primary: 'bg-primary border-primary/20 text-primary-foreground shadow-md shadow-primary/10',
        secondary: 'bg-secondary border-secondary/20 text-secondary-foreground shadow-md shadow-secondary/10',
        muted: 'bg-card border-border text-foreground',
    };

    return (
        <div className={`p-5 rounded-xl border transition-all hover:scale-[1.02] cursor-default ${colors[color]}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${color === 'muted' ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{trend}</span>
                    </div>
                )}
            </div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${color === 'muted' ? 'text-muted-foreground' : 'text-white/60'}`}>{label}</p>
            <p className="text-xl font-bold tracking-tight mb-1 leading-none">{value}</p>
            <p className={`text-[10px] ${color === 'muted' ? 'text-muted-foreground/60' : 'text-white/40'}`}>{desc}</p>
        </div>
    );
}
