'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { TrendingUp, Users, Scissors, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, LayoutGrid } from 'lucide-react';

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalAppointments: 0, totalExpenses: 0, netProfit: 0, commissions: [], revenueByMethod: {}, revenueByOrigin: {}, revenueByBarber: {} });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [isAdding, setIsAdding] = useState(false);
    const [newTrans, setNewTrans] = useState({ description: '', amount: '', type: 'EXPENSE', category: 'Outros' });

    useEffect(() => {
        fetchFinance();
    }, [period]);

    const fetchFinance = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            let startDate = new Date();
            if (period === 'day') startDate.setHours(0, 0, 0, 0);
            else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
            else startDate.setMonth(startDate.getMonth() - 1);

            const res = await api.get(`/finance/stats?barbershopId=${bId}&startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`);
            setStats(res.data || { totalRevenue: 0, totalAppointments: 0, totalExpenses: 0, netProfit: 0, commissions: [], revenueByMethod: {}, revenueByOrigin: {}, revenueByBarber: {} });
            setTransactions(res.data?.transactions || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/transactions', { ...newTrans, barbershopId });
            setNewTrans({ description: '', amount: '', type: 'EXPENSE', category: 'Outros' });
            setIsAdding(false);
            fetchFinance();
            alert('Lançamento realizado com sucesso!');
        } catch (err) {
            alert('Erro ao salvar lançamento');
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm('Excluir este lançamento?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchFinance();
        } catch (err) {
            alert('Erro ao excluir');
        }
    };

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Fluxo Financeiro</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gestão estratégica de entradas, saídas e comissões.</p>
                    </div>
                </div>

                {/* PERIOD SELECTOR */}
                <div className="flex bg-background p-1.5 rounded-2xl border border-border w-full md:w-auto overflow-x-auto">
                    {['day', 'week', 'month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-card text-primary shadow-xl border border-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? <div className="p-8 text-center text-muted-foreground animate-pulse uppercase font-black tracking-widest text-xs">Sincronizando dados financeiros...</div> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-card p-8 rounded-[2rem] border border-border text-foreground relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faturamento Bruto</p>
                                <h2 className="text-3xl font-black mt-2 group-hover:text-primary transition-colors uppercase">{formatBRL(stats.totalRevenue)}</h2>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total processado</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm relative group overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Serviços / Jobs</p>
                            <h2 className="text-3xl font-black mt-2 text-foreground uppercase">{stats.totalAppointments}</h2>
                            <p className="text-[9px] mt-4 text-primary font-black uppercase tracking-widest bg-primary/10 w-fit px-2 py-1 rounded">Agendamentos concluídos</p>
                        </div>

                        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custos & Comissões</p>
                            <h2 className="text-3xl font-black mt-2 text-destructive uppercase">{formatBRL(stats.totalExpenses + (stats.totalCommissions || 0))}</h2>
                            <p className="text-[9px] mt-4 text-muted-foreground font-black uppercase tracking-widest">Comprometimento de caixa</p>
                        </div>

                        <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground shadow-2xl shadow-primary/20">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lucro Líquido</p>
                            <h2 className="text-4xl font-black mt-1 leading-none uppercase">{formatBRL(stats.netProfit)}</h2>
                            <p className="text-[9px] mt-4 font-black uppercase tracking-widest bg-black/5 w-fit px-2 py-1 rounded">Performance Financeira</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* REVENUE BREAKDOWNS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Por Método</h3>
                                    <div className="space-y-3">
                                        {stats.revenueByMethod && Object.entries(stats.revenueByMethod).length > 0 ? (
                                            Object.entries(stats.revenueByMethod).map(([method, val]) => (
                                                <div key={method} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">{method === 'CREDIT_CARD' ? 'Cartão' : method}</span>
                                                    <span className="font-black text-primary">{formatBRL(val)}</span>
                                                </div>
                                            ))
                                        ) : <p className="text-[10px] italic text-muted-foreground">Sem dados</p>}
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Por Origem</h3>
                                    <div className="space-y-3">
                                        {stats.revenueByOrigin && Object.entries(stats.revenueByOrigin).length > 0 ? (
                                            Object.entries(stats.revenueByOrigin).map(([origin, val]) => (
                                                <div key={origin} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">{origin}</span>
                                                    <span className="font-black text-secondary">{formatBRL(val)}</span>
                                                </div>
                                            ))
                                        ) : <p className="text-[10px] italic text-muted-foreground">Sem dados</p>}
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm md:col-span-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Por Profissional (Receita Gerada)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stats.revenueByBarber && Object.entries(stats.revenueByBarber).length > 0 ? (
                                            Object.entries(stats.revenueByBarber).map(([barber, val]) => (
                                                <div key={barber} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">{barber}</span>
                                                    <span className="font-black text-primary">{formatBRL(val)}</span>
                                                </div>
                                            ))
                                        ) : <p className="text-[10px] italic text-muted-foreground">Sem dados</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Fluxo de Caixa</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Lançamentos manuais e operacionais</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-xl shadow-primary/20"
                                    >
                                        NOVO LANÇAMENTO
                                    </button>
                                </div>

                                {isAdding && (
                                    <form onSubmit={handleAddTransaction} className="mb-8 p-8 bg-background rounded-[2rem] border border-border grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black ml-1 uppercase text-muted-foreground tracking-widest">Descrição</label>
                                            <input placeholder="Ex: Produto Limpeza, Aluguel..." value={newTrans.description} onChange={e => setNewTrans({ ...newTrans, description: e.target.value })} className="w-full p-4 bg-card border border-border rounded-xl outline-none focus:ring-2 ring-primary text-foreground font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black ml-1 uppercase text-muted-foreground tracking-widest">Valor</label>
                                            <input type="number" step="0.01" placeholder="0.00" value={newTrans.amount} onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })} className="w-full p-4 bg-card border border-border rounded-xl outline-none focus:ring-2 ring-primary text-foreground font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black ml-1 uppercase text-muted-foreground tracking-widest">Tipo</label>
                                            <select value={newTrans.type} onChange={e => setNewTrans({ ...newTrans, type: e.target.value })} className="w-full p-4 bg-card border border-border rounded-xl outline-none focus:ring-2 ring-primary text-foreground font-bold appearance-none">
                                                <option value="EXPENSE">SAÍDA (Custo)</option>
                                                <option value="INCOME">ENTRADA (Extra)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4 flex gap-3 justify-end pt-2">
                                            <button type="submit" className="bg-secondary text-secondary-foreground px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80">SALVAR</button>
                                            <button type="button" onClick={() => setIsAdding(false)} className="bg-muted text-muted-foreground px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-border">CANCELAR</button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-4">
                                    {transactions.length > 0 ? transactions.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-4 rounded-2xl border ${t.type === 'INCOME' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                                    {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tight text-foreground mb-1">{t.description}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category || 'Operacional'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className={`font-black text-xl uppercase ${t.type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}{formatBRL(t.amount)}
                                                </p>
                                                <button onClick={() => handleDeleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                    <ArrowDownRight className="w-5 h-5 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl">
                                            <p className="text-muted-foreground italic font-black uppercase tracking-widest text-[10px]">Sem movimentações extras no período</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-8">Pay-out Equipe</h3>
                            <div className="space-y-8">
                                {stats.commissions && stats.commissions.length > 0 ? stats.commissions.map((c, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center font-black text-primary border border-border uppercase text-xl shadow-inner">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-widest text-foreground leading-none mb-1">{c.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Acumulado</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-primary text-lg uppercase tracking-tight">
                                                {formatBRL(c.value)}
                                            </p>
                                        </div>
                                        <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border shadow-inner">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (c.value / (stats.totalRevenue || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-24 text-center">
                                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground italic text-[10px] uppercase font-black tracking-widest">Nenhuma comissão pendente</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 p-8 bg-background rounded-3xl border border-border flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Provisão de Saída Total</p>
                                <h4 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                                    {formatBRL(stats.commissions?.reduce((acc, curr) => acc + curr.value, 0) || 0)}
                                </h4>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
