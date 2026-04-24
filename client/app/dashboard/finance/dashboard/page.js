'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { TrendingUp, DollarSign, Users, ShoppingCart, Plus } from 'lucide-react';
import NewTransactionModal from '../../../../components/NewTransactionModal';

export default function FinancialDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [user, setUser] = useState(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            
            const bId = parsedUser.barbershopId || parsedUser.barbershop?.id || parsedUser.ownedBarbershops?.[0]?.id;

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

    const maxRevenue = Math.max(...data.revenueByDay.map(d => d.value), 1);
    
    // Cálculo seguro dos métodos de recebimento faturados (Baixas em comandas)
    const recCash = (data.revenueByMethod?.CASH || 0) + (data.revenueByMethod?.MONEY || 0);
    const recPix = data.revenueByMethod?.PIX || 0;
    const recCard = (data.revenueByMethod?.CREDIT_CARD || 0) + (data.revenueByMethod?.DEBIT_CARD || 0) + (data.revenueByMethod?.CARD || 0);
    
    // Encontrar os "Outros" (Ex: SUBSCRIPTION, ONLINE, etc) excluindo os principais
    const mainKeys = ['CASH', 'MONEY', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CARD'];
    const recOther = Object.keys(data.revenueByMethod || {}).reduce((sum, key) => {
        if (!mainKeys.includes(key.toUpperCase())) return sum + data.revenueByMethod[key];
        return sum;
    }, 0);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Dashboard Financeiro</h1>
                    <p className="text-muted-foreground text-sm font-medium italic mt-2">Visão completa do faturamento e saldo</p>
                </div>
                <button 
                    onClick={() => setIsTransactionModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                >
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
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 font-black uppercase">Total de receita bruta por dia</p>

                    <div className="relative h-64 w-full">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-full border-t border-white/5 h-0" />
                            ))}
                        </div>

                        <div className="relative h-full flex items-end gap-1.5 pt-10">
                            {data.revenueByDay.map((day, idx) => {
                                const heightPercent = (day.value / maxRevenue) * 100;
                                const hasRevenue = day.value > 0;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                                        <div
                                            className="w-full rounded-t-lg transition-all cursor-pointer relative"
                                            style={{
                                                height: hasRevenue ? `calc(${heightPercent}% + 4px)` : '0%',
                                                backgroundColor: hasRevenue ? '#4F7CFF' : 'transparent',
                                                boxShadow: hasRevenue ? '0 0 20px rgba(79, 124, 255, 0.2)' : 'none'
                                            }}
                                        >
                                            {hasRevenue && (
                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-primary ring-4 ring-primary/20" />
                                            )}

                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-popover p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-border shadow-2xl z-50 scale-90 group-hover:scale-100">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter mb-1">{day.date}</p>
                                                <p className="text-sm font-black text-primary">R$ {day.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>

                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                                        </div>
                                        <span className="text-[8px] font-bold text-muted-foreground mt-3 rotate-45 origin-left whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                            {day.date.split('/')[0]}/{day.date.split('/')[1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
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
                    <p className="opacity-70 text-xs font-black uppercase tracking-widest mb-2">Saldo Líquido no caixa</p>
                    <p className="text-4xl font-black mb-1">R$ {data.balance.toFixed(2)}</p>
                    <p className="opacity-70 text-[10px] font-medium">Total de recebimentos - Total de saídas</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-2">Entradas Faturadas</p>
                    <p className="text-3xl font-black text-primary mb-1">R$ {data.totalReceived.toFixed(2)}</p>
                    <p className="text-muted-foreground text-[10px] font-medium">(Taxas de pagamento já descontadas)</p>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-2">Saídas Registradas</p>
                    <p className="text-3xl font-black text-destructive mb-1">R$ {data.totalExpenses.toFixed(2)}</p>
                    <p className="text-muted-foreground text-[10px] font-medium">Total despesas e saídas no período</p>
                </div>
            </div>

            {/* Valores Recebidos */}
            <div className="bg-card p-8 rounded-3xl border border-border">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6">Composição de Entradas (Faturamento Confirmado)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Dinheiro</p>
                        <p className="text-2xl font-black text-foreground">R$ {recCash.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Cartão</p>
                        <p className="text-2xl font-black text-foreground">R$ {recCard.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Pix</p>
                        <p className="text-2xl font-black text-foreground">R$ {recPix.toFixed(2)}</p>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-border">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Outros</p>
                        <p className="text-2xl font-black text-foreground">R$ {recOther.toFixed(2)}</p>
                    </div>
                    <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-primary-foreground">
                        <p className="opacity-70 text-[10px] font-black uppercase tracking-widest mb-2">Pendente (A Receber)</p>
                        <p className="text-2xl font-black">R$ {data.toReceive.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <NewTransactionModal 
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                user={user}
                type="INCOME"
                onSuccess={fetchDashboard}
            />
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
