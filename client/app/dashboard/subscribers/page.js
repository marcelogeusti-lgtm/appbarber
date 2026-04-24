'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Users, UserCheck, UserX, UserMinus, Search,
    Download, Filter, ChevronRight, TrendingUp, Zap
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
            const { data } = await api.get('/subscriptions/list');

            const formatted = data.map(sub => ({
                ...sub,
                joined: new Date(sub.joined || sub.createdAt).toLocaleDateString('pt-BR'),
                expiry: sub.expiry ? new Date(sub.expiry).toLocaleDateString('pt-BR') : 'N/A',
                ltv: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sub.ltv || 0)
            }));

            setSubscribers(formatted);

            const active = formatted.filter(s => s.status === 'ACTIVE').length;
            const expired = formatted.filter(s => s.status === 'EXPIRED').length;
            const cancelled = formatted.filter(s => s.status === 'CANCELLED').length;

            setStats({ active, expired, cancelled, total: formatted.length });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            ACTIVE: { label: 'Ativo', classes: 'bg-primary/10 text-primary border-primary/20' },
            EXPIRED: { label: 'Vencido', classes: 'bg-secondary/20 text-secondary-foreground border-secondary/30' },
            CANCELLED: { label: 'Cancelado', classes: 'bg-destructive/10 text-destructive border-destructive/20' }
        };
        const item = config[status] || config.CANCELLED;
        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner ${item.classes}`}>
                {item.label}
            </span>
        );
    };

    const filtered = subscribers.filter(s => {
        const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.id?.includes(search);
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Clube de Membros...</div>;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] -mr-40 -mt-40" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Clube de Membros</h1>
                    <p className="text-muted-foreground text-sm font-medium italic mt-2 uppercase tracking-widest text-[10px] opacity-80">Gestão de assinaturas e recorrência da sua base VIP.</p>
                </div>
                <button className="relative z-10 flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    <Download className="w-5 h-5" /> Exportar Dados
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard label="Membros Ativos" value={stats.active} desc="Assinaturas em dia" icon={<UserCheck className="w-6 h-6" />} color="primary" />
                <KPICard label="Pendências" value={stats.expired} desc="Aguardando renovação" icon={<UserX className="w-6 h-6" />} color="secondary" />
                <KPICard label="Churn Rate" value={stats.cancelled} desc="Cancelamentos totais" icon={<UserMinus className="w-6 h-6" />} color="destructive" />
                <KPICard label="Total Acumulado" value={stats.total} desc="Histórico da base" icon={<Users className="w-6 h-6" />} color="primary" />
            </div>

            {/* Content Table Container */}
            <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden relative">
                {/* Search & Tabs */}
                <div className="p-10 border-b border-border bg-muted/10 flex flex-col xl:flex-row gap-10">
                    <div className="flex bg-background rounded-xl p-2 border border-border shadow-inner w-fit">
                        <button className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-card text-primary shadow-xl border border-border">Base de Clientes</button>
                        <button className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">Relatório LTV</button>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                            <input
                                placeholder="Buscar por nome ou ID do assinante..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl py-5 pl-14 pr-6 text-sm font-bold text-foreground focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-background border border-border rounded-xl px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:ring-4 ring-primary/10 appearance-none min-w-[180px] shadow-inner"
                            >
                                <option value="ALL">Todos os Status</option>
                                <option value="ACTIVE">Ativos</option>
                                <option value="EXPIRED">Vencidos</option>
                                <option value="CANCELLED">Cancelados</option>
                            </select>
                            <button className="bg-foreground text-background px-10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all active:scale-95 shadow-xl">
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Identificador</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Membro VIP</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Plano Elite</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Fidelidade</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Expiração</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">LTV Total</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border text-center">Status</th>
                                <th className="px-8 py-8 border-b border-border"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filtered.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-all group cursor-pointer border-b border-border last:border-0">
                                    <td className="px-8 py-8 font-mono text-[9px] text-muted-foreground/60">#{sub.id?.slice(0, 8)}</td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:bg-primary/10 transition-colors">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{sub.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse"></div>
                                            <span className="text-xs font-black text-foreground uppercase tracking-tighter">{sub.plan || 'Plano Gold'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{sub.joined}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{sub.expiry}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-2 text-primary font-black text-sm tracking-tighter uppercase whitespace-nowrap">
                                            <TrendingUp className="w-4 h-4" /> {sub.ltv || 'R$ 0,00'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <StatusBadge status={sub.status} />
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <footer className="p-10 bg-muted/20 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Exibindo {filtered.length} de {stats.total} registros</p>
                    <div className="flex gap-4">
                        <button className="px-10 py-3.5 rounded-xl bg-background text-muted-foreground font-black text-[10px] uppercase tracking-widest border border-border hover:text-foreground transition-all shadow-sm">Anterior</button>
                        <button className="px-10 py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">Próxima Página</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function KPICard({ label, value, desc, icon, color }) {
    const colorStyles = {
        primary: {
            iconContainer: 'bg-primary/10 text-primary border-primary/20 shadow-primary/10',
            glow: 'bg-primary/5'
        },
        secondary: {
            iconContainer: 'bg-secondary/20 text-secondary-foreground border-secondary/30 shadow-secondary/10',
            glow: 'bg-secondary/10'
        },
        destructive: {
            iconContainer: 'bg-destructive/10 text-destructive border-destructive/20 shadow-destructive/10',
            glow: 'bg-destructive/5'
        }
    };

    const style = colorStyles[color] || colorStyles.primary;

    return (
        <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/20 transition-all group shadow-sm hover:shadow-2xl relative overflow-hidden flex flex-col h-full">
            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${style.glow}`}></div>

            <div className={`p-5 rounded-xl w-fit mb-8 group-hover:scale-110 transition-transform border ${style.iconContainer} shadow-sm`}>
                {icon}
            </div>

            <div className="space-y-2 mt-auto relative z-10">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{label}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors duration-300">{value}</span>
                </div>
                <div className="pt-6 border-t border-border mt-6">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em] italic opacity-60">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
}
