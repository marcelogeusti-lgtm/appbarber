'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle,
    Lock,
    Unlock,
    RefreshCcw,
    ClipboardList,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function CaixaPage() {
    const [shift, setShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    const [closingBalance, setClosingBalance] = useState('');

    useEffect(() => {
        fetchShiftStatus();
    }, []);

    const fetchShiftStatus = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/finance/shift/current?barbershopId=${bId}`);
            setShift(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleOpenShift = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/finance/shift/open', {
                barbershopId: bId,
                openingBalance: openingBalance || 0
            });
            fetchShiftStatus();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao abrir caixa');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseShift = async (e) => {
        e.preventDefault();
        if (!confirm('Deseja realmente fechar o caixa de hoje?')) return;
        setActionLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/finance/shift/close', {
                barbershopId: bId,
                closingBalance: closingBalance || shift.currentBalance
            });
            fetchShiftStatus();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao fechar caixa');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Sincronizando fluxo...</div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Caixa do Dia</h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium italic">Controle de abertura, fechamento e movimentações em tempo real.</p>
                </div>

                <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                    {shift ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest animate-pulse">
                            <Unlock className="w-3 h-3" /> Caixa Aberto
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-950 text-slate-500 px-4 py-2 rounded-xl border border-slate-800 font-black text-[10px] uppercase tracking-widest">
                            <Lock className="w-3 h-3" /> Caixa Fechado
                        </div>
                    )}
                    <button
                        onClick={fetchShiftStatus}
                        className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </header>

            {!shift ? (
                /* Opening Screen */
                <div className="max-w-2xl mx-auto bg-[#111827] p-12 rounded-[3.5rem] border border-slate-800 text-center space-y-8">
                    <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-2xl">
                        <Lock className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">O caixa está fechado</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Abra o caixa para começar a registrar vendas e recebimentos.</p>
                    </div>

                    <form onSubmit={handleOpenShift} className="space-y-6 bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800/50">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Saldo Inicial (Opcional)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={openingBalance}
                                    onChange={e => setOpeningBalance(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-xl font-black text-white focus:ring-2 ring-emerald-500 outline-none transition"
                                />
                            </div>
                        </div>

                        <button
                            disabled={actionLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#111827] py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
                            Abrir Caixa Agora
                        </button>
                    </form>
                </div>
            ) : (
                /* Active Shift Dashboard */
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Main Stats Column */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Opening Balance Card */}
                            <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo de Abertura</p>
                                    <p className="text-4xl font-black text-white">R$ {parseFloat(shift.openingBalance).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <ArrowUpCircle className="w-24 h-24 text-white/5 absolute -right-6 -bottom-6 group-hover:scale-110 transition-transform" />
                            </div>

                            {/* Current Balance Card */}
                            <div className="bg-emerald-500 p-8 rounded-[2.5rem] border border-emerald-400 relative overflow-hidden group shadow-2xl shadow-emerald-500/10">
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] font-black text-emerald-900/50 uppercase tracking-widest">Saldo Atual em Caixa</p>
                                    <p className="text-4xl font-black text-[#111827]">R$ {parseFloat(shift.currentBalance).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <DollarSign className="w-24 h-24 text-[#111827]/10 absolute -right-6 -bottom-6 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>

                        {/* Recent Movements List */}
                        <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 overflow-hidden">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-black text-sm uppercase tracking-widest text-white flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-emerald-500" /> Movimentações do Turno
                                </h3>
                                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-tighter">Ver Todas</button>
                            </div>

                            <div className="divide-y divide-slate-800/50">
                                {/* Placeholder for movements list - to be implemented in phase 2 */}
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
                                        <ArrowDownCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">O histórico detalhado aparecerá aqui.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions Column */}
                    <div className="space-y-8">
                        {/* Close Shift Card */}
                        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg text-xs">
                                    <Lock size={16} />
                                </div>
                                <h4 className="font-black text-white uppercase text-xs tracking-widest">Encerrar Turno</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed px-1 uppercase tracking-tighter">Confira os valores e finalize o caixa para gerar o fechamento diário.</p>

                            <form onSubmit={handleCloseShift} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Total Contado (Opcional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder={`R$ ${parseFloat(shift.currentBalance).toFixed(2)}`}
                                        value={closingBalance}
                                        onChange={e => setClosingBalance(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-orange-500"
                                    />
                                </div>
                                <button
                                    className="w-full bg-slate-100 hover:bg-white text-[#111827] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-lg"
                                >
                                    Fechar Caixa Agora
                                </button>
                            </form>
                        </div>

                        {/* Info Helper */}
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-slate-600 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                                Movimentações automáticas são geradas sempre que uma <span className="text-white">Comanda</span> é finalizada.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
