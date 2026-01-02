'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Users, UserCheck, UserX, UserMinus, Search,
    Download, Filter, ChevronRight, TrendingUp
} from 'lucide-react';

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({ active: 0, expired: 0, cancelled: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            // Mocking for UI demonstration, will connect to backend analytics later
            const mockSubscribers = [
                { id: '596160', name: 'Abel Vargas', plan: 'Corte e Barba Essencial', joined: '18/07/2023', expiry: '18/08/2024', ltv: 'R$ 1.200', status: 'ACTIVE' },
                { id: '864118', name: 'Abilio Pereira de Faria', plan: 'Clube One', joined: '21/04/2023', expiry: '21/08/2024', ltv: 'R$ 800', status: 'ACTIVE' },
                { id: '814422', name: 'Abner Sousa Nascimento', plan: 'Clube One', joined: '06/02/2023', expiry: '06/08/2024', ltv: 'R$ 1.100', status: 'EXPIRED' },
                { id: '945842', name: 'Adriano Gomes Dias', plan: 'Corte e Barba Flex', joined: '12/05/2023', expiry: '12/08/2024', ltv: 'R$ 450', status: 'ACTIVE' },
                { id: '106136', name: 'Adriano Tupy', plan: 'Barba Essencial', joined: '28/06/2023', expiry: '28/08/2024', ltv: 'R$ 300', status: 'CANCELLED' },
            ];
            setSubscribers(mockSubscribers);
            setStats({ active: 931, expired: 60, cancelled: 600, total: 1591 });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            ACTIVE: { label: 'Ativo', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
            EXPIRED: { label: 'Vencido', classes: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
            CANCELLED: { label: 'Cancelado', classes: 'bg-red-500/10 text-red-500 border-red-500/20' }
        };
        const item = config[status] || config.CANCELLED;
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.classes}`}>
                {item.label}
            </span>
        );
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header & Export */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-10 rounded-[2.5rem] border border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Clube de Membros</h1>
                    <p className="text-slate-500 text-sm font-medium italic mt-2 uppercase tracking-widest text-[10px]">Gestão estratégica de receita recorrente e fidelidade</p>
                </div>
                <button className="flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] transition-all active:scale-95">
                    <Download className="w-4 h-4" /> Exportar Dados
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    label="Membros Ativos"
                    value={stats.active}
                    desc="Assinaturas em dia"
                    icon={<UserCheck className="w-6 h-6" />}
                    color="emerald"
                />
                <KPICard
                    label="Pendências"
                    value={stats.expired}
                    desc="Aguardando renovação"
                    icon={<UserX className="w-6 h-6" />}
                    color="white"
                />
                <KPICard
                    label="Churn Rate"
                    value={stats.cancelled}
                    desc="Cancelamentos totais"
                    icon={<UserMinus className="w-6 h-6" />}
                    color="red"
                />
                <KPICard
                    label="Database Total"
                    value={stats.total}
                    desc="Histórico acumulado"
                    icon={<Users className="w-6 h-6" />}
                    color="emerald"
                />
            </div>

            {/* Filters & Table */}
            <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex bg-slate-950 rounded-2xl p-1.5 border border-slate-800">
                        <button className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#111827] text-emerald-500 shadow-xl border border-emerald-500/10">Base de Clientes</button>
                        <button className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Relatório LTV</button>
                    </div>

                    <div className="flex-1 flex gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                placeholder="Buscar por nome ou ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:ring-2 ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-300 outline-none focus:ring-2 ring-emerald-500 appearance-none"
                        >
                            <option value="ALL">Status: Todos</option>
                            <option value="ACTIVE">ATIVOS</option>
                            <option value="EXPIRED">VENCIDOS</option>
                            <option value="CANCELLED">CANCELADOS</option>
                        </select>
                        <button className="bg-white text-[#111827] px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg">
                            Filtrar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">ID Ident</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">Assinante</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">Plano Elite</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">Membro Desde</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">Renovação</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">LTV Acumulado</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 text-center">Status</th>
                                <th className="p-6 border-b border-slate-800"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {subscribers.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-emerald-500/5 transition-all group cursor-pointer">
                                    <td className="p-6 font-mono text-[10px] text-slate-600">{sub.id}</td>
                                    <td className="p-6 font-black text-sm text-white uppercase tracking-tighter">{sub.name}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{sub.plan}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{sub.joined}</td>
                                    <td className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{sub.expiry}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                                            <TrendingUp className="w-3.5 h-3.5" /> {sub.ltv}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <StatusBadge status={sub.status} />
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/40 transition-all">
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-950/20 border-t border-slate-800 flex justify-between items-center text-[#111827]">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest uppercase">Exibindo registros de {subscribers.length} de {stats.total} total</p>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest border border-slate-800 hover:text-white transition-all">Anterior</button>
                        <button className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Ver Mais</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, desc, icon, color }) {
    const colors = {
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
        white: 'text-white bg-slate-900 border-slate-800 shadow-slate-900/10',
        red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    };

    return (
        <div className={`p-8 rounded-[2.5rem] bg-[#111827] border border-slate-800 hover:border-emerald-500/20 transition-all group shadow-2xl relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <div className={`p-4 rounded-2xl w-fit ${colors[color]} mb-6 group-hover:scale-110 transition-transform border`}>
                {icon}
            </div>
            <div className="space-y-1 relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter leading-none">{value}</span>
                </div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] pt-4 group-hover:text-emerald-500 transition-colors">
                    {desc}
                </p>
            </div>
        </div>
    );
}
