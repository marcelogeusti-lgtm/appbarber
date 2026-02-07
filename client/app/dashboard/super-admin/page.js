'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import UpdateRolloutManager from './UpdateRolloutManager';
import { Shield, BarChart3, Activity, Zap, TrendingUp, Globe, ExternalLink, Trash2, Settings } from 'lucide-react';

// ... imports remain the same

export default function SuperAdminPage() {
    const [barbershops, setBarbershops] = useState([]);
    const [stats, setStats] = useState({ activeUnits: 0, mrr: 0, provisioning: 0, churn: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [shopsRes, statsRes] = await Promise.all([
                api.get('/barbershops'),
                api.get('/admin/stats')
            ]);
            setBarbershops(Array.isArray(shopsRes.data) ? shopsRes.data : []);
            setStats(statsRes.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao carregar dados. Verifique se você é um Super Admin.');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        if (!confirm('Tem certeza que deseja alterar o status desta unidade?')) return;
        try {
            await api.patch(`/admin/barbershops/${id}/toggle-status`);
            fetchData(); // Refresh list
        } catch (err) {
            alert('Erro ao alterar status');
        }
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Acessando Camada de Governança...</div>;

    if (error) return (
        <div className="p-10 text-center bg-destructive/10 border border-destructive/20 rounded-[2.5rem] m-8">
            <h2 className="text-destructive font-black uppercase text-xl mb-2 tracking-tighter">Acesso Restrito</h2>
            <p className="text-muted-foreground text-sm font-medium italic">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] border border-primary/20 flex items-center justify-center text-4xl shadow-inner group">
                        <Shield className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Gestão Global SaaS</h1>
                        <p className="text-muted-foreground text-sm font-medium italic mt-1 leading-none uppercase tracking-widest text-[10px] opacity-80">Controle maestro da Rede Barbe-On Diamond</p>
                    </div>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Relatório de Tráfego
                    </button>
                    <button className="bg-card border border-border text-muted-foreground px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all shadow-sm">
                        Logs de Sistema
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    label="Unidades Ativas"
                    value={stats.activeUnits}
                    desc={`Total de ${stats.activeUnits} parceiros`} // Simplified description
                    icon={<Globe className="w-6 h-6" />}
                    color="primary"
                    trend="+5%" // Mock trend or calculate
                />
                <KPICard
                    label="Receita SaaS (MRR)"
                    value={`R$ ${stats.mrr.toLocaleString('pt-BR')}`}
                    desc="Recorrência Mensal"
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="primary"
                />
                <KPICard
                    label="Provisionamento"
                    value={stats.provisioning}
                    desc="Pendentes de Aprovação"
                    icon={<Zap className="w-6 h-6" />}
                    color="secondary"
                />
                <KPICard
                    label="Retenção (Churn)"
                    value={`${stats.churn}%`}
                    desc="Taxa de Permanência"
                    icon={<Activity className="w-6 h-6" />}
                    color="primary"
                    isSolid
                />
            </div>

            {/* Master Update Manager */}
            <div className="bg-card rounded-[3rem] border border-border shadow-md overflow-hidden">
                <UpdateRolloutManager />
            </div>

            {/* Partners Table */}
            <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden relative">
                <div className="p-10 border-b border-border bg-muted/10 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-foreground uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" /> Controle Maestro de Parceiros
                        </h3>
                    </div>
                    <div className="flex bg-background p-1.5 rounded-xl border border-border gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-muted border border-border"></div>
                        <div className="w-3 h-3 rounded-full bg-muted border border-border"></div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Entidade Global</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Governança (Owner)</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Tier de Assinatura</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border text-right">Ações de Comando</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {barbershops.map(shop => (
                                <tr key={shop.id} className="hover:bg-primary/5 transition-all group border-b border-border last:border-0">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-muted rounded-xl border border-border flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                                                🏪
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase text-sm tracking-tight">{shop.name}</p>
                                                <p className="text-[10px] text-primary font-mono mt-1 group-hover:translate-x-1 transition-transform italic bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">/{shop.slug}</p>
                                                {shop.subscriptionStatus === 'SUSPENDED' && <span className="ml-2 text-[9px] bg-destructive text-destructive-foreground px-1 rounded">SUSPENSO</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="font-black text-foreground text-xs uppercase tracking-tight">{shop.owner?.name || 'Sistema Cores'}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60 truncate max-w-[200px]">{shop.owner?.email || 'suporte@barbeon.com'}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="bg-primary/10 text-primary border border-primary/30 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner">{shop.saasPlan}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={() => alert('Em breve: Acesso administrativo direto ao painel do parceiro.')}
                                                className="bg-background border border-border text-muted-foreground px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <Settings className="w-3 h-3" /> Gerenciar
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(shop.id)}
                                                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center gap-2 ${shop.subscriptionStatus === 'ACTIVE'
                                                    ? 'bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground'
                                                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                            >
                                                {shop.subscriptionStatus === 'ACTIVE' ? <><Trash2 className="w-3 h-3" /> Suspender</> : <><Zap className="w-3 h-3" /> Ativar</>}
                                            </button>
                                        </div>
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

function KPICard({ label, value, desc, icon, color, isSolid, trend }) {
    const colorStyles = {
        primary: {
            bg: isSolid ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card text-foreground border-border',
            icon: isSolid ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border-primary/20',
            label: isSolid ? 'text-white/60' : 'text-muted-foreground',
            desc: isSolid ? 'text-white/80' : 'text-muted-foreground',
            value: isSolid ? 'text-white' : 'text-foreground hover:text-primary'
        },
        secondary: {
            bg: 'bg-card text-foreground border-border',
            icon: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
            label: 'text-muted-foreground',
            desc: 'text-muted-foreground',
            value: 'text-foreground'
        }
    };

    const style = colorStyles[color] || colorStyles.primary;

    return (
        <div className={`${style.bg} p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
            <div className="relative z-10">
                <div className={`p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform border ${style.icon}`}>
                    {icon}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${style.label}`}>{label}</h4>
                <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-black tracking-tighter leading-none transition-colors duration-300 ${style.value}`}>{value}</span>
                    {trend && <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">{trend}</span>}
                </div>
                <div className="mt-8 pt-6 border-t border-border/10 opacity-60">
                    <p className={`text-[9px] font-black uppercase tracking-widest italic leading-none ${style.desc}`}>{desc}</p>
                </div>
            </div>
            {!isSolid && <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>}
        </div>
    );
}
