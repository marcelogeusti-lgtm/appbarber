'use client';
import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Wallet, RefreshCw, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../lib/api';

export default function CashierPanel({ isOpen, onClose, user, onOpenNewOrder, onOpenNewExpense }) {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    // ...
    // ...

    const [loading, setLoading] = useState(false);

    const getBarbershopId = () => user?.barbershop?.id || user?.workedBarbershop?.id || user?.ownedBarbershops?.[0]?.id;

    // Fetch stats whenever the panel is opened
    useEffect(() => {
        const shopId = getBarbershopId();
        if (isOpen && shopId) {
            fetchStats(shopId);
        }
    }, [isOpen, user]);

    const fetchStats = async (shopId) => {
        if (!shopId) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [statsRes, transRes] = await Promise.all([
                api.get(`/dashboard/finance/dashboard?barbershopId=${shopId}&startDate=${today}&endDate=${today}`),
                api.get(`/transactions?barbershopId=${shopId}&startDate=${today}&endDate=${today}`)
            ]);
            setStats(statsRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error('Error fetching cashier stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-[#111827] border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="h-20 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0f1523]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-none">Caixa do Dia</h2>
                            <p className="text-xs text-slate-500 mt-1">Visão geral financeira</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-5rem)]">

                    {/* Status Card */}
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status do Caixa</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-500 uppercase">Aberto</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs mb-1">Saldo Atual</p>
                                {loading ? (
                                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>
                                ) : (
                                    <h3 className={`text-2xl font-black ${stats?.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                                        {formatCurrency(stats?.balance)}
                                    </h3>
                                )}
                            </div>
                            <button
                                onClick={() => fetchStats(getBarbershopId())}
                                className={`p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all ${loading ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-500">Entradas</span>
                            </div>
                            <p className="text-lg font-bold text-white">
                                {loading ? '...' : formatCurrency(stats?.totalReceived)}
                            </p>
                        </div>
                        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-500">Saídas</span>
                            </div>
                            <p className="text-lg font-bold text-white">
                                {loading ? '...' : formatCurrency(stats?.totalExpenses)}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Ações Rápidas</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={onOpenNewOrder}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group w-full text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <PlusCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400">Nova Venda</p>
                                    <p className="text-[10px] text-slate-500">Criar comanda rápida</p>
                                </div>
                            </button>

                            <button
                                onClick={onOpenNewExpense}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 transition-all group w-full text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <MinusCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-red-400">Lançar Despesa</p>
                                    <p className="text-[10px] text-slate-500">Registrar saída manual</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Breakdown (Optional for Phase 2) */}
                    {stats && (
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                <span>Em Comandas Abertas</span>
                                <span className="font-bold text-slate-300">{formatCurrency(stats.totalOpenCommands)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>Ticket Médio (Dia)</span>
                                <span className="font-bold text-slate-300">
                                    {stats.totalClients > 0
                                        ? formatCurrency(stats.totalRevenue / stats.totalClients)
                                        : 'R$ 0,00'}
                                </span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
