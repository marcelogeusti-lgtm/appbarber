'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { Users, Download, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function CommissionsReportPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/commissions/report?barbershopId=${bId}&startDate=${startDate}&endDate=${endDate}`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handlePayCommissions = async (barberId) => {
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/commissions/pay', { barberId, barbershopId: bId });
            alert('Comissões pagas com sucesso!');
            fetchReport();
        } catch (err) {
            console.error(err);
            alert('Erro ao dar baixa nas comissões');
        }
    };

    if (loading || !data) {
        return <div className="p-8 text-center text-slate-400 animate-pulse">Carregando relatório...</div>;
    }

    // Dados para o gráfico de pizza
    const chartData = data.barbers.map((b, idx) => ({
        name: b.barberName,
        value: b.totalCommissions,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]
    }));

    const totalChart = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Relatório de Colaboradores</h1>
                    <p className="text-slate-500 text-sm font-medium italic mt-2">Comissões e performance da equipe</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all">
                        <DollarSign className="w-4 h-4" /> Dar baixa nas comissões
                    </button>
                    <button className="flex items-center gap-2 bg-[#111827] border border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500/10 transition-all">
                        <Download className="w-4 h-4" /> Exportar em excel
                    </button>
                </div>
            </div>

            {/* Resumo Geral */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <KPICard label="Vendas Total" value={`R$ ${data.summary.totalSales.toFixed(2)}`} color="slate" />
                <KPICard label="Total de serviços" value={`R$ ${data.summary.totalServices.toFixed(2)}`} color="emerald" />
                <KPICard label="Assinaturas" value={data.summary.totalSubscriptions} desc="Comissões" color="emerald" />
                <KPICard label="Comissões Pagas" value={`R$ ${data.summary.totalPaidCommissions.toFixed(2)}`} color="slate" />
                <KPICard label="Comissões Pendentes" value={`R$ ${data.summary.totalPendingCommissions.toFixed(2)}`} color="red" />
            </div>

            {/* Gráfico de Pizza + Filtros */}
            <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Gráfico */}
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Detalhamento de comissões</h3>
                        <div className="relative w-64 h-64 mx-auto">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {chartData.map((item, idx) => {
                                    const prevSum = chartData.slice(0, idx).reduce((sum, d) => sum + d.value, 0);
                                    const percentage = (item.value / totalChart) * 100;
                                    const offset = (prevSum / totalChart) * 100;
                                    return (
                                        <circle
                                            key={idx}
                                            cx="100"
                                            cy="100"
                                            r="80"
                                            fill="none"
                                            stroke={item.color}
                                            strokeWidth="40"
                                            strokeDasharray={`${percentage * 5.03} ${500 - percentage * 5.03}`}
                                            strokeDashoffset={-offset * 5.03}
                                            className="transition-all hover:opacity-80 cursor-pointer"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-white">R$ {totalChart.toFixed(0)}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-bold text-slate-400">{item.name}</span>
                                    <span className="ml-auto text-sm font-black text-white">R$ {item.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Início</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Fim</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 ring-orange-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchReport}
                            className="w-full bg-orange-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                        >
                            Pesquisar
                        </button>
                        <button className="w-full bg-[#0a0f1a] border border-slate-800 text-slate-400 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Adicionar lançamento para o barbeiro
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela de Barbeiros */}
            <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0a0f1a]">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total em Serviços</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Comissão Serviços</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Comissão Produtos</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Comissão Assinatura</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total em Extras</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Compras de Produto</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.barbers.map((barber, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                                <Users className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{barber.barberName}</p>
                                                <p className="text-xs text-slate-500 font-medium">{barber.appointmentCount} agendamentos</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-white">R$ {barber.totalServices.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-500">R$ {barber.serviceCommission.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-white">R$ {barber.productCommission.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-white">R$ {barber.subscriptionCommission.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-white">R$ {barber.extras.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-red-500">-R$ {barber.productPurchases.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handlePayCommissions(barber.barberId)}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-600 transition-all"
                                        >
                                            Dar Baixa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, desc, color }) {
    const colors = {
        slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{label}</p>
            <p className="text-2xl font-black mb-1">{value}</p>
            {desc && <p className="text-[10px] font-medium opacity-60">{desc}</p>}
        </div>
    );
}
