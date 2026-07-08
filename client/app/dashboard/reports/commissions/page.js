'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { Users, Download, DollarSign, TrendingUp, AlertCircle, Calendar, Zap } from 'lucide-react';

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
            alert(err.response?.data?.message || 'Erro ao dar baixa nas comissões');
        }
    };

    const handleGiveAdvance = async (barber) => {
        const input = prompt(`Vale / Adiantamento para ${barber.barberName}\n\nDigite o valor (R$) a adiantar:`);
        if (input === null) return;
        const value = Number(String(input).replace(',', '.'));
        if (!value || value <= 0) {
            alert('Valor inválido.');
            return;
        }
        if (!confirm(`Confirmar vale de R$ ${value.toFixed(2)} para ${barber.barberName}?\n\nIsso lança uma despesa no caixa e abate das comissões dele.`)) return;
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            await api.post('/commissions/advance', { barberId: barber.barberId, barbershopId: bId, amount: value });
            alert('Vale registrado com sucesso!');
            fetchReport();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Erro ao registrar o vale');
        }
    };

    if (loading || !data) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando relatório de equipe...</div>;
    }

    const chartData = data.barbers.map((b, idx) => ({
        name: b.barberName,
        value: b.totalCommissions,
        color: ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--muted)', '#8b5cf6'][idx % 5]
    }));

    const totalChart = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Relatório de Equipe</h1>
                    <p className="text-muted-foreground text-sm font-medium italic mt-2">Monitoramento de produtividade e repasses financeiros</p>
                </div>
                <div className="flex flex-wrap gap-4 relative z-10">
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        <DollarSign className="w-4 h-4" /> Efetuar Pagamentos
                    </button>
                    <button className="flex items-center gap-2 bg-background border border-border text-muted-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all font-bold">
                        <Download className="w-4 h-4" /> Exportar Dados
                    </button>
                </div>
            </header>

            {/* Resumo Geral */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard label="Volume de Vendas" value={`R$ ${data.summary.totalSales.toFixed(2)}`} color="muted" />
                <KPICard label="Total em Serviços" value={`R$ ${data.summary.totalServices.toFixed(2)}`} color="primary" />
                <KPICard label="Comissão Assinaturas" value={data.summary.totalSubscriptions} desc="Total Estimado" color="primary" />
                <KPICard label="Já Liquidado" value={`R$ ${data.summary.totalPaidCommissions.toFixed(2)}`} color="muted" />
                <KPICard label="Pendente" value={`R$ ${data.summary.totalPendingCommissions.toFixed(2)}`} color="destructive" />
            </div>

            {/* Gráfico de Pizza + Filtros */}
            <div className="bg-card p-10 rounded-xl border border-border shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Gráfico */}
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-10 border-l-4 border-primary pl-4">Distribuição de Resultados</h3>
                        <div className="relative w-64 h-64 mx-auto">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {chartData.map((item, idx) => {
                                    const prevSum = chartData.slice(0, idx).reduce((sum, d) => sum + d.value, 0);
                                    const percentage = totalChart > 0 ? (item.value / totalChart) * 100 : 0;
                                    const offset = totalChart > 0 ? (prevSum / totalChart) * 100 : 0;
                                    return (
                                        <circle
                                            key={idx}
                                            cx="100"
                                            cy="100"
                                            r="80"
                                            fill="none"
                                            stroke={item.color === 'var(--primary)' ? 'hsl(var(--primary))' : item.color}
                                            strokeWidth="28"
                                            strokeDasharray={`${percentage * 5.03} 503`}
                                            strokeDashoffset={-offset * 5.03}
                                            className="transition-all hover:opacity-80 cursor-pointer duration-700 ease-out"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-foreground tracking-tighter leading-none">R$ {totalChart.toFixed(0)}</p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 border-t border-border pt-1">Total Equipe</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.name.includes('var') ? `hsl(${item.color})` : item.color }}></div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate flex-1">{item.name}</span>
                                    <span className="text-xs font-black text-foreground">R$ {item.value.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-background/50 p-8 rounded-xl border border-border shadow-inner">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Período Inicial</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full bg-card border border-border rounded-xl px-10 py-4 text-foreground font-bold focus:ring-2 ring-primary outline-none transition-all text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Período Final</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full bg-card border border-border rounded-xl px-10 py-4 text-foreground font-bold focus:ring-2 ring-primary outline-none transition-all text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchReport}
                                    className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    <Zap className="w-5 h-5" /> Atualizar Dashboard
                                </button>
                            </div>
                        </div>
                        <div className="p-8 border border-primary/10 rounded-xl bg-primary/5 flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed italic">
                                Use os filtros para visualizar a performance em janelas de tempo específicas ou conferir repasses de ciclos fechados para toda sua equipe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Barbeiros */}
            <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-10 py-8 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Colaborador</th>
                                <th className="px-6 py-8 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Volume Bruto</th>
                                <th className="px-6 py-8 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Comissão Serv.</th>
                                <th className="px-6 py-8 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Comissão Prod.</th>
                                <th className="px-6 py-8 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Líquido</th>
                                <th className="px-10 py-8 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Gerenciar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {data.barbers.map((barber, idx) => {
                                const liquidTotal = (barber.serviceCommission + barber.productCommission + barber.subscriptionCommission + (barber.extras || 0) - (barber.productPurchases || 0) - (barber.advancesTaken || 0));
                                return (
                                    <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-muted rounded-[1.2rem] border border-border flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                                                    <Users className="w-7 h-7 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-foreground uppercase tracking-tight">{barber.barberName}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{barber.appointmentCount} Atendimentos</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-right text-xs font-black text-muted-foreground">R$ {barber.totalServices.toFixed(2)}</td>
                                        <td className="px-6 py-8 text-right text-xs font-black text-primary">R$ {barber.serviceCommission.toFixed(2)}</td>
                                        <td className="px-6 py-8 text-right text-xs font-black text-foreground">R$ {barber.productCommission.toFixed(2)}</td>
                                        <td className="px-6 py-8 text-right bg-primary/5">
                                            <span className="text-lg font-black text-primary tracking-tighter uppercase whitespace-nowrap">R$ {liquidTotal.toFixed(2)}</span>
                                            {(barber.advancesTaken || 0) > 0 && (
                                                <span className="block text-[9px] font-black text-destructive uppercase tracking-widest mt-1">
                                                    − R$ {barber.advancesTaken.toFixed(2)} em vale
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleGiveAdvance(barber)}
                                                    className="bg-background border border-border text-muted-foreground px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all shadow-sm active:scale-95"
                                                    title="Adiantar um valor (vale) que será abatido das comissões"
                                                >
                                                    Vale
                                                </button>
                                                <button
                                                    onClick={() => handlePayCommissions(barber.barberId)}
                                                    className="bg-primary/10 text-primary border border-primary/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95"
                                                >
                                                    Dar Baixa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, desc, color }) {
    const colors = {
        muted: 'bg-card text-muted-foreground border-border',
        primary: 'bg-card text-primary border-primary/20',
        destructive: 'bg-card text-destructive border-destructive/20',
    };

    return (
        <div className={`p-8 rounded-xl border shadow-md relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-100">{label}</p>
            <p className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{value}</p>
            {desc && <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50 italic">{desc}</p>}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
        </div>
    );
}
