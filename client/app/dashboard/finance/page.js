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
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Fluxo Financeiro</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Gestão estratégica de entradas, saídas e comissões.</p>
                    </div>
                </div>
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
                    {['day', 'week', 'month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-[#111827] text-emerald-500 shadow-xl border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Faturamento Bruto</p>
                        <h2 className="text-3xl font-black mt-2 group-hover:text-emerald-500 transition-colors uppercase">{formatBRL(stats.totalRevenue)}</h2>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Total processado</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-sm relative group overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Serviços / Jobs</p>
                    <h2 className="text-3xl font-black mt-2 text-white uppercase">{stats.totalAppointments}</h2>
                    <p className="text-[9px] mt-4 text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 w-fit px-2 py-1 rounded">Agendamentos concluídos</p>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custos & Comissões</p>
                    <h2 className="text-3xl font-black mt-2 text-red-500 uppercase">{formatBRL(stats.totalExpenses + (stats.totalCommissions || 0))}</h2>
                    <p className="text-[9px] mt-4 text-slate-600 font-black uppercase tracking-widest">Comprometimento de caixa</p>
                </div>

                <div className="bg-emerald-500 p-8 rounded-[2rem] text-[#111827] shadow-2xl shadow-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lucro Líquido</p>
                    <h2 className="text-4xl font-black mt-1 leading-none uppercase">{formatBRL(stats.netProfit)}</h2>
                    <p className="text-[9px] mt-4 font-black uppercase tracking-widest bg-black/5 w-fit px-2 py-1 rounded">Performance Financeira</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Fluxo de Caixa</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lançamentos manuais e operacionais</p>
                            </div>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20"
                            >
                                NOVO LANÇAMENTO
                            </button>
                        </div>

                        {isAdding && (
                            <form onSubmit={handleAddTransaction} className="mb-8 p-8 bg-slate-950 rounded-[2rem] border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black ml-1 uppercase text-slate-500 tracking-widest">Descrição</label>
                                    <input placeholder="Ex: Produto Limpeza, Aluguel..." value={newTrans.description} onChange={e => setNewTrans({ ...newTrans, description: e.target.value })} className="w-full p-4 bg-[#111827] border border-slate-800 rounded-xl outline-none focus:ring-2 ring-emerald-500 text-white font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black ml-1 uppercase text-slate-500 tracking-widest">Valor</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={newTrans.amount} onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })} className="w-full p-4 bg-[#111827] border border-slate-800 rounded-xl outline-none focus:ring-2 ring-emerald-500 text-white font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black ml-1 uppercase text-slate-500 tracking-widest">Tipo</label>
                                    <select value={newTrans.type} onChange={e => setNewTrans({ ...newTrans, type: e.target.value })} className="w-full p-4 bg-[#111827] border border-slate-800 rounded-xl outline-none focus:ring-2 ring-emerald-500 text-white font-bold appearance-none">
                                        <option value="EXPENSE">SAÍDA (Custo)</option>
                                        <option value="INCOME">ENTRADA (Extra)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4 flex gap-3 justify-end pt-2">
                                    <button type="submit" className="bg-white text-slate-900 px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200">SALVAR</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-900 text-slate-500 px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-800">CANCELAR</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {transactions.length > 0 ? transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-950/20 rounded-2xl border border-slate-800/50 group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl border ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight text-white mb-1">{t.description}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category || 'Operacional'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className={`font-black text-xl uppercase ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatBRL(t.amount)}
                                        </p>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-800 hover:text-red-500 transition-colors">
                                            <ArrowDownRight className="w-5 h-5 rotate-45" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                                    <p className="text-slate-600 italic font-black uppercase tracking-widest text-[10px]">Sem movimentações extras no período</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-8">Pay-out Equipe</h3>
                    <div className="space-y-8">
                        {stats.commissions && stats.commissions.length > 0 ? stats.commissions.map((c, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-emerald-500 border border-slate-800 uppercase text-xl shadow-inner">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-widest text-white leading-none mb-1">{c.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Acumulado</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-emerald-500 text-lg uppercase tracking-tight">
                                        {formatBRL(c.value)}
                                    </p>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900 shadow-inner">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (c.value / (stats.totalRevenue || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center">
                                <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-600 italic text-[10px] uppercase font-black tracking-widest">Nenhuma comissão pendente</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 p-8 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Provisão de Saída Total</p>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {formatBRL(stats.commissions?.reduce((acc, curr) => acc + curr.value, 0) || 0)}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
