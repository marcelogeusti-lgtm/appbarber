'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { TrendingUp, Users, Scissors, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalAppointments: 0, totalExpenses: 0, netProfit: 0, commissions: [] });
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
            setStats(res.data || { totalRevenue: 0, totalAppointments: 0, totalExpenses: 0, netProfit: 0, commissions: [] });
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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse uppercase font-black tracking-widest text-xs">Sincronizando dados financeiros...</div>;

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8 pb-20 text-slate-900 dark:text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Fluxo Financeiro</h1>
                    <p className="text-slate-500 text-sm font-medium">Controle de caixa, lucros e comissões</p>
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto overflow-x-auto">
                    {['day', 'week', 'month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-lg shadow-orange-500/5' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Faturamento Bruto</p>
                        <h2 className="text-3xl font-black mt-1">{formatBRL(stats.totalRevenue)}</h2>
                        <p className="text-[9px] mt-4 font-bold opacity-40 uppercase tracking-widest">Serviços + Outras Entradas</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><Scissors /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Cortes</p>
                    <h2 className="text-3xl font-black mt-1">{stats.totalAppointments}</h2>
                    <p className="text-[9px] mt-4 text-orange-500 font-black uppercase tracking-widest">Agendamentos Concluídos</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Despesas Totais</p>
                    <h2 className="text-3xl font-black mt-1 text-red-500">{formatBRL(stats.totalExpenses + (stats.totalCommissions || 0))}</h2>
                    <p className="text-[9px] mt-4 text-slate-400 font-bold uppercase tracking-widest">Incluindo Comissões</p>
                </div>

                <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-2xl shadow-emerald-600/30">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lucro Líquido</p>
                    <h2 className="text-4xl font-black mt-1 leading-none">{formatBRL(stats.netProfit)}</h2>
                    <p className="text-[9px] mt-4 font-black uppercase tracking-widest bg-white/10 w-fit px-2 py-1 rounded inline-block">Resultado Real</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter">Movimentações de Caixa</h3>
                                <p className="text-xs text-slate-400 font-medium italic">Entradas manuais e despesas operacionais</p>
                            </div>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                            >
                                NOVO LANÇAMENTO
                            </button>
                        </div>

                        {isAdding && (
                            <form onSubmit={handleAddTransaction} className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black ml-2 uppercase text-slate-400">Descrição</label>
                                    <input placeholder="Ex: Aluguel, Compra de Sprays..." value={newTrans.description} onChange={e => setNewTrans({ ...newTrans, description: e.target.value })} className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 text-sm" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black ml-2 uppercase text-slate-400">Valor (R$)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={newTrans.amount} onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })} className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 text-sm" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black ml-2 uppercase text-slate-400">Tipo</label>
                                    <select value={newTrans.type} onChange={e => setNewTrans({ ...newTrans, type: e.target.value })} className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 text-sm">
                                        <option value="EXPENSE">Saída (Gasto)</option>
                                        <option value="INCOME">Entrada (Extra)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4 flex gap-2 justify-end">
                                    <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">SALVAR</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-200 dark:bg-slate-700 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">CANCELAR</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {transactions.length > 0 ? transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-orange-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm uppercase tracking-tight">{t.description}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {t.category || 'Outros'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className={`font-black text-lg ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatBRL(t.amount)}
                                        </p>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><ArrowDownRight className="w-4 h-4 rotate-45" /></button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center">
                                    <p className="text-slate-400 italic font-medium uppercase tracking-widest text-[10px]">Sem movimentações extras no período</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8">Comissões da Equipe</h3>
                    <div className="space-y-8">
                        {stats.commissions && stats.commissions.length > 0 ? stats.commissions.map((c, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-500 uppercase">{c.name.charAt(0)}</div>
                                        <p className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">{c.name}</p>
                                    </div>
                                    <p className="font-black text-orange-500 text-sm">
                                        {formatBRL(c.value)}
                                    </p>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-full rounded-full"
                                        style={{ width: `${Math.min(100, (c.value / (stats.totalRevenue || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 italic text-xs uppercase font-bold text-center py-20">Aguardando dados de serviço...</p>
                        )}
                    </div>

                    <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Total em Comissões</p>
                        <h4 className="text-2xl font-black mt-1 leading-none">
                            {formatBRL(stats.commissions?.reduce((acc, curr) => acc + curr.value, 0) || 0)}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
