'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { TrendingUp, Users, Scissors, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, LayoutGrid, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import NewTransactionModal from '../../../components/NewTransactionModal';

export default function FinancePage() {
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState('month');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Auth Helper
    const getUser = () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const user = getUser();
    const bId = user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id;

    // Fetch Stats with useQuery
    const { data: stats, isLoading } = useQuery({
        queryKey: ['finance-stats', bId, period],
        queryFn: async () => {
            if (!bId) return null;
            let startDate = new Date();
            if (period === 'day') startDate.setHours(0, 0, 0, 0);
            else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
            else startDate.setMonth(startDate.getMonth() - 1);

            const res = await api.get(`/finance/stats?barbershopId=${bId}&startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`);
            return res.data;
        },
        enabled: !!bId,
    });

    const transactions = stats?.transactions || [];

    const deleteMutation = useMutation({
        mutationFn: async (id) => api.delete(`/transactions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
            toast.success('Lançamento excluído');
        },
        onError: () => toast.error('Erro ao excluir'),
    });

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

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

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando dados...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-card p-8 rounded-[2rem] border border-border text-foreground overflow-hidden group">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faturamento Bruto</p>
                            <h2 className="text-3xl font-black mt-2 group-hover:text-primary transition-colors uppercase">{formatBRL(stats?.totalRevenue)}</h2>
                        </div>

                        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm relative group">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jobs / Serviços</p>
                            <h2 className="text-3xl font-black mt-2 text-foreground uppercase">{stats?.totalOrders || 0}</h2>
                        </div>

                        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custos & Comissões</p>
                            <h2 className="text-3xl font-black mt-2 text-destructive uppercase">{formatBRL((stats?.totalExpenses || 0) + (stats?.totalCommissions || 0))}</h2>
                        </div>

                        <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground shadow-2xl shadow-primary/20">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lucro Líquido</p>
                            <h2 className="text-4xl font-black mt-1 uppercase">{formatBRL(stats?.netProfit)}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Fluxo de Caixa</h3>
                                    <button
                                        onClick={() => setIsTransactionModalOpen(true)}
                                        className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-xl shadow-primary/20"
                                    >
                                        LANÇAR MOVIMENTAÇÃO
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {transactions.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-border hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-4 rounded-2xl border ${t.type === 'INCOME' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                                    {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase text-foreground">{t.description}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className={`font-black text-xl uppercase ${t.type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}{formatBRL(t.amount)}
                                                </p>
                                                <button onClick={() => deleteMutation.mutate(t.id)} className="text-muted-foreground hover:text-destructive"><ArrowDownRight className="rotate-45 w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                            <h3 className="text-xl font-black uppercase text-foreground mb-8">Pauta de Equipe</h3>
                            <div className="space-y-8">
                                {stats?.commissions?.map((c, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-black uppercase">
                                            <span>{c.name}</span>
                                            <span className="text-primary">{formatBRL(c.value)}</span>
                                        </div>
                                        <div className="h-1.5 bg-background rounded-full overflow-hidden border border-border">
                                            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${Math.min(100, (c.value / (stats.totalRevenue || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <NewTransactionModal 
                        isOpen={isTransactionModalOpen}
                        onClose={() => setIsTransactionModalOpen(false)}
                        user={user}
                        type="EXPENSE"
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['finance-stats'] })}
                    />
                </>
            )}
        </div>
    );
}
