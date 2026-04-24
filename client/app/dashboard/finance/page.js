'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { 
    TrendingUp, Users, Scissors, DollarSign, Calendar, 
    ArrowUpRight, ArrowDownRight, CreditCard, LayoutGrid, 
    Loader2, PieChart, Wallet, BarChart3, Receipt, 
    ChevronRight, ArrowRight, Download, Filter, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import NewTransactionModal from '../../../components/NewTransactionModal';

export default function FinancePage() {
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState('month');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const getUser = () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const user = getUser();
    const bId = user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id;

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

    const deleteMutation = useMutation({
        mutationFn: async (id) => api.delete(`/transactions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
            toast.success('Lançamento excluído');
        },
        onError: () => toast.error('Erro ao excluir'),
    });

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    const transactions = stats?.transactions || [];

    if (!bId) return <div className="p-20 text-center font-bold">Barbearia não encontrada.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
            {/* Header com Design Premium */}
            <header className="relative overflow-hidden bg-card/40 backdrop-blur-xl p-10 rounded-xl border border-border/50 shadow-2xl group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-primary/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Fluxo Financeiro</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Inteligência em tempo real para sua barbearia
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button 
                            onClick={async () => {
                                try {
                                    const res = await api.get(`/finance/export?barbershopId=${bId}`, { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `financeiro_${bId}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                } catch (e) {
                                    toast.error("Erro ao exportar dados");
                                }
                            }}
                            className="p-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" /> Exportar CSV
                        </button>

                        <div className="flex bg-background/50 p-1.5 rounded-xl border border-border shadow-inner">
                            {['day', 'week', 'month'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <DollarSign className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Consolidando balanço financeiro...</p>
                </div>
            ) : (
                <>
                    {/* Big Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Faturamento Bruto', value: stats?.totalRevenue, icon: DollarSign, color: 'primary' },
                            { label: 'Total de Vendas', value: stats?.totalOrders, icon: Receipt, color: 'blue', isNumber: true },
                            { label: 'Despesas e Comissões', value: (stats?.totalExpenses || 0) + (stats?.totalCommissions || 0), icon: ArrowDownRight, color: 'destructive' },
                            { label: 'Lucro Líquido', value: stats?.netProfit, icon: Wallet, color: 'green', highlight: true }
                        ].map((item, idx) => (
                            <div key={idx} className={`relative overflow-hidden p-8 rounded-xl border border-border/50 shadow-xl transition-all hover:translate-y-[-4px] ${item.highlight ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-card'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.highlight ? 'bg-white/20' : 'bg-muted/50 text-muted-foreground'}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${item.highlight ? 'opacity-80' : 'text-muted-foreground'}`}>{item.label}</p>
                                <h2 className="text-3xl font-black mt-2 tracking-tighter">
                                    {item.isNumber ? item.value : formatBRL(item.value)}
                                </h2>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Listagem de Transações */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-border/30 flex justify-between items-center">
                                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                        Movimentações do Período
                                    </h3>
                                    <button
                                        onClick={() => setIsTransactionModalOpen(true)}
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Novo Lançamento
                                    </button>
                                </div>

                                <div className="p-4 space-y-3">
                                    {transactions.length > 0 ? transactions.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/50 transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                                                    {t.type === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tight">{t.description}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(t.date).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                                                        <span className="text-[10px] text-primary uppercase font-black">{t.paymentMethod || 'Outros'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <p className={`font-black text-2xl tracking-tighter ${t.type === 'INCOME' ? 'text-green-500' : 'text-foreground'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}{formatBRL(t.amount)}
                                                </p>
                                                <button onClick={() => deleteMutation.mutate(t.id)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                                                    <ArrowDownRight className="rotate-45 w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center flex flex-col items-center opacity-40">
                                            <Receipt className="w-12 h-12 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação encontrada</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Coluna de Insights (Ranking e Métodos) */}
                        <div className="space-y-8">
                            {/* Ranking Equipe */}
                            <div className="bg-card p-10 rounded-xl border border-border/50 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10"></div>
                                <h3 className="text-xl font-black uppercase text-foreground mb-8 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-primary" /> Performance Equipe
                                </h3>
                                <div className="space-y-8">
                                    {stats?.commissions?.map((c, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-[10px] font-bold text-muted-foreground">{i + 1}</div>
                                                    <span className="text-xs font-black uppercase">{c.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-primary">{formatBRL(c.value)}</span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-primary h-full rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.min(100, (c.value / (stats.totalRevenue || 1)) * 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Breakdown Métodos */}
                            <div className="bg-card p-10 rounded-xl border border-border/50 shadow-sm">
                                <h3 className="text-xl font-black uppercase text-foreground mb-8 flex items-center gap-3">
                                    <PieChart className="w-6 h-6 text-primary" /> Meios de Pagamento
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(stats?.revenueByMethod || {}).map(([method, value], idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{method}</span>
                                            </div>
                                            <span className="text-sm font-black">{formatBRL(value)}</span>
                                        </div>
                                    ))}
                                </div>
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

