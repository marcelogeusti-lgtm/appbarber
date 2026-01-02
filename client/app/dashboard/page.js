'use client';
import { useEffect, useState } from 'react';
import { Users, Copy, TrendingUp, ShoppingBag } from 'lucide-react';
import api from '../../lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, revenue: 0, clients: 0 });

    useEffect(() => {
        try {
            const u = localStorage.getItem('user');
            if (u) {
                const parsedUser = JSON.parse(u);
                setUser(parsedUser);
                if (parsedUser.role === 'ADMIN' || parsedUser.role === 'BARBER') {
                    fetchStats();
                }
            }
        } catch (err) {
            console.error('Error parsing user data:', err);
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/appointments/pro');
            const data = res.data || [];
            setStats({
                appointments: data.length,
                revenue: data.reduce((acc, curr) => acc + Number(curr?.service?.price || 0), 0),
                clients: new Set(data.map(a => a.clientId)).size,
                today: data.filter(a => a.date && new Date(a.date).toDateString() === new Date().toDateString()).length
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    if (!user) return <div className="p-8 text-center">Carregando...</div>;

    const publicUrl = user?.barbershop?.slug
        ? `https://corteconexao.com.br/agendamento/${user.barbershop.slug}`
        : user?.ownedBarbershops?.[0]?.slug
            ? `https://corteconexao.com.br/agendamento/${user.ownedBarbershops[0].slug}`
            : '';

    const copyToClipboard = () => {
        if (!publicUrl) {
            alert('Link não disponível. Verifique se sua barbearia está configurada.');
            return;
        }
        navigator.clipboard.writeText(publicUrl);
        alert('Link copiado para a área de transferência!');
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center font-black text-2xl border border-emerald-500/20 shadow-inner">
                        {user.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Olá, {user.name}! ✂️</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user.role === 'SUPER_ADMIN' ? '👑 Master System' : user.role === 'ADMIN' ? '🏢 Gestor Barber' : '✂️ Elite Barber'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/home" className="bg-slate-950 text-slate-500 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-all flex items-center gap-2">
                        Ver como Cliente
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-emerald-500 text-white rounded-lg"><Users className="w-4 h-4" /></div>
                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Link de Agendamento Profissional</h3>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-500 break-all flex items-center justify-between group/link">
                                {publicUrl || 'Sincronizando...'}
                                <button onClick={copyToClipboard} className="ml-4 p-2 bg-slate-900 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-slate-500">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    className="flex-1 md:flex-none bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition text-center shadow-xl"
                                >
                                    Abrir Página
                                </a>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-600 mt-5 uppercase font-bold tracking-widest italic">Este link é a porta de entrada para novos agendamentos 24h por dia.</p>
                    </div>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center items-center text-center">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Jobs para Hoje</h3>
                    <p className="text-7xl font-black text-white hover:text-emerald-500 transition-colors uppercase leading-none">{stats.today || 0}</p>
                    <div className="mt-4 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Atendimento Dinâmico</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-32 h-32 text-emerald-500" />
                    </div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Performance Histórica</h3>
                    <div className="flex flex-col gap-2">
                        <p className="text-5xl font-black text-white uppercase tracking-tighter transition-all group-hover:translate-x-3">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                        </p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Faturamento acumulado em serviços</p>
                    </div>
                </div>

                <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-slate-800 relative group">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Nossa Comunidade</h3>
                    <div className="flex flex-col gap-2">
                        <p className="text-6xl font-black text-white uppercase tracking-tighter group-hover:translate-x-3 transition-all">
                            {stats.clients}
                        </p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Clientes reais na sua base</p>
                    </div>
                </div>
            </div>

            {/* Experience Box */}
            <div className="bg-slate-950 rounded-[3rem] p-12 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShoppingBag className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">A experiência <span className="text-emerald-500">Premium</span> de agendamento.</h2>
                    <p className="text-slate-400 font-medium mb-10 leading-relaxed uppercase text-xs tracking-widest">
                        O Barbe-On foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#111827] p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Simplicidade</p>
                            <p className="text-[11px] font-bold text-white tracking-tight uppercase">Acesso direto via QR Code ou Link Bio</p>
                        </div>
                        <div className="bg-[#111827] p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Agilidade</p>
                            <p className="text-[11px] font-bold text-white tracking-tight uppercase">Seleção de profissional em 3 toques</p>
                        </div>
                        <div className="bg-[#111827] p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Retenção</p>
                            <p className="text-[11px] font-bold text-white tracking-tight uppercase">Histórico e fidelidade automático</p>
                        </div>
                    </div>
                </div>
            </div>

            {stats.appointments === 0 && (
                <div className="bg-emerald-500/5 p-12 rounded-[3.5rem] border-4 border-dashed border-slate-800 text-center">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Primeiros Passos...</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Configure seus serviços e comece a faturar hoje mesmo.</p>
                        <a href="/dashboard/services" className="inline-block bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-2xl shadow-emerald-500/40">
                            Cadastrar Meus Serviços
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
