'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { TrendingUp, DollarSign, Users, ShoppingCart, Plus } from 'lucide-react';

export default function FinancialDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/finance/dashboard?barbershopId=${bId}&startDate=${startDate}&endDate=${endDate}`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando dashboard...</div>;
    }

    const maxRevenue = Math.max(...data.revenueByDay.map(d => d.value));

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Dashboard Financeiro</h1>
                    <p className="text-muted-foreground text-sm font-medium italic mt-2">Visão completa do faturamento e saldo</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
                    <Plus className="w-4 h-4" /> Adicionar Lançamento
                </button>
            </div>

            {/* Filtros de Data */}
            <div className="bg-card p-6 rounded-3xl border border-border flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Início</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 ring-primary outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Fim</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 ring-primary outline-none"
                    />
                </div>
                <button
                    onClick={fetchDashboard}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    Pesquisar
                </button>
            </div>

            {/* Gráfico de Faturamento */}
            <div className="bg-card p-8 rounded-3xl border border-border">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6">Faturamento Bruto no período selecionado</h3>

                <div className="mb-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total de receita bruta por dia</p>
                    <div className="relative h-64 flex items-end gap-1">
                        {data.revenueByDay.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center group">
                                <div
                                    className="w-full bg-gradient-to-t from-primary to-primary/80 rounded-t-lg transition-all hover:to-primary/60 cursor-pointer relative"
                                    style={{ height: `${(day.value / (maxRevenue || 1)) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover px-2 py-1 rounded text-[10px] font-black text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                                        R$ {day.value.toFixed(2)}
                                    </div>
                                </div>
                                <span className="text-[8px] font-bold text-muted-foreground mt-2">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard
                        label="Total bruto de vendas no período"
                        value={`R$ ${data.totalRevenue.toFixed(2)}`}
                        desc="Valor total bruto das comandas finalizadas"
                        color="primary"
                    />
                    <KPICard
                        label="Total das comandas em aberto"
                        value={`R$ ${data.totalOpenCommands.toFixed(2)}`}
                        desc={`${data.openCommands} comandas`}
                        color="secondary"
                    />
                    <KPICard
                        label="Total de clientes"
                        value={data.totalClients}
                        desc="Clientes únicos atendidos"
                        color="muted"
                    />
                    <KPICard
                        label="Por dia - Média de clientes"
                        value={data.avgClientsPerDay}
                        desc="Média diária de atendimentos"
                        color="accent"
                    />
                </div>
            </div>

            {/* Saldo do Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary p-8 rounded-3xl shadow-2xl shadow-primary/20 text-primary-foreground">
                    <p className="opacity-70 text-xs font-black uppercase tracking-widest mb-2">Saldo do período</p>
                    <p className="text-4xl font-black mb-1">R$ {data.balance.toFixed(2)}</p>
                    <p className="opacity-70 text-[10px] font-medium">Total de recebimentos - Total de saídas</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-2">Total de Recebimentos no período</p>
                    <p className="text-3xl font-black text-primary mb-1">R$ {data.totalReceived.toFixed(2)}</p>
                    <p className="text-muted-foreground text-[10px] font-medium">(Taxas de pagamento já descontadas)</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-2">Total de Saídas no período</p>
                    <p className="text-3xl font-black text-destructive mb-1">R$ {data.totalExpenses.toFixed(2)}</p>
                    <p className="text-muted-foreground text-[10px] font-medium">Total de despesas do período</p>
                </div>
            </div>

            {/* Valores a Receber */}
            <div className="bg-card p-8 rounded-3xl border border-border">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6">Valores a receber no período selecionado</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Dinheiro</p>
                        <p className="text-2xl font-black text-foreground">R$ {data.toReceiveCash.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Cartão</p>
                        <p className="text-2xl font-black text-foreground">R$ {data.toReceiveCard.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Pix</p>
                        <p className="text-2xl font-black text-foreground">R$ {data.toReceivePix.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Outros</p>
                        <p className="text-2xl font-black text-foreground">R$ 0,00</p>
                    </div>
                    <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-primary-foreground">
                        <p className="opacity-70 text-[10px] font-black uppercase tracking-widest mb-2">Total a Receber</p>
                        <p className="text-2xl font-black">R$ {data.toReceive.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, desc, color }) {
    const colors = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border-secondary/20',
        muted: 'bg-muted/10 text-muted-foreground border-border',
        accent: 'bg-accent/10 text-accent-foreground border-accent/20',
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{label}</p>
            <p className="text-3xl font-black mb-1">{value}</p>
            <p className="text-[10px] font-medium opacity-60">{desc}</p>
        </div>
    );
}
