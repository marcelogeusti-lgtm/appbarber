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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-10 rounded-[2.5rem] border border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Relatório de Equipe</h1>
                    <p className="text-slate-500 text-sm font-medium italic mt-2">Monitoramento de produtividade e repasses financeiros</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                        <DollarSign className="w-4 h-4" /> Efetuar Pagamentos
                    </button>
                    <button className="flex items-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-emerald-500/30 transition-all">
                        <Download className="w-4 h-4" /> Exportar Dados
                    </button>
                </div>
            </div>

            {/* Resumo Geral */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <KPICard label="Volume de Vendas" value={`R$ ${data.summary.totalSales.toFixed(2)}`} color="slate" />
                <KPICard label="Total em Serviços" value={`R$ ${data.summary.totalServices.toFixed(2)}`} color="emerald" />
                <KPICard label="Comissão Assinaturas" value={data.summary.totalSubscriptions} desc="Total Estimado" color="emerald" />
                <KPICard label="Já Liquidado" value={`R$ ${data.summary.totalPaidCommissions.toFixed(2)}`} color="slate" />
                <KPICard label="Pendente" value={`R$ ${data.summary.totalPendingCommissions.toFixed(2)}`} color="red" />
            </div>

            {/* Gráfico de Pizza + Filtros */}
            <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Gráfico */}
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-[0.1em] mb-8 border-l-4 border-emerald-500 pl-4">Distribuição de Resultados</h3>
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
                                            strokeWidth="30"
                                            strokeDasharray={`${percentage * 5.03} ${500 - percentage * 5.03}`}
                                            strokeDashoffset={-offset * 5.03}
                                            className="transition-all hover:opacity-80 cursor-pointer"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-white tracking-tighter">R$ {totalChart.toFixed(0)}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Total Equipe</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/30">
                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }}></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{item.name}</span>
                                    <span className="ml-auto text-[11px] font-black text-white">R$ {item.value.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Período Inicial</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 ring-emerald-500 outline-none transition-all text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Período Final</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 ring-emerald-500 outline-none transition-all text-xs"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={fetchReport}
                                    className="w-full bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                    Atualizar Dashboards
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border border-emerald-500/10 rounded-2xl bg-emerald-500/5">
                            <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest leading-relaxed italic">
                                Use os filtros para visualizar a performance em janelas de tempo específicas ou conferir repasses de ciclos fechados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Barbeiros */}
            <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0a0f1a]">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Colaborador</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Serviços (Bruto)</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Comissão Serv.</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Comissão Prod.</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Total Líquido</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Fluxo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {data.barbers.map((barber, idx) => (
                                <tr key={idx} className="hover:bg-emerald-500/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">{barber.barberName}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{barber.appointmentCount} Atendimentos</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-slate-300">R$ {barber.totalServices.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-500">R$ {barber.serviceCommission.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-white">R$ {barber.productCommission.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-400 bg-emerald-500/5">R$ {(barber.serviceCommission + barber.productCommission + barber.subscriptionCommission + barber.extras - barber.productPurchases).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => handlePayCommissions(barber.barberId)}
                                            className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
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
        slate: 'bg-[#111827] text-slate-300 border-slate-800',
        emerald: 'bg-[#111827] text-emerald-500 border-emerald-500/20',
        red: 'bg-[#111827] text-red-500 border-red-500/20',
    };

    return (
        <div className={`p-8 rounded-[2rem] border shadow-xl relative overflow-hidden group ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-50">{label}</p>
            <p className="text-3xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left text-white">{value}</p>
            {desc && <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-40">{desc}</p>}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-current opacity-5 rounded-full blur-2xl"></div>
        </div>
    );
}
