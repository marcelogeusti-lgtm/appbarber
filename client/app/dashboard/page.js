'use client';
import { useEffect, useState } from 'react';
import {
    Users, Copy, TrendingUp, ShoppingBag, RefreshCw, DollarSign, Calendar,
    ArrowRight, Scissors, Share2, Instagram, Settings, Star, QrCode, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import api from '../../lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [todayStats, setTodayStats] = useState({
        appointments: 0,
        revenue: 0,
        newClients: 0, // Changed from clients to newClients to match usage
        revenueTrend: '+0% vs ontem',
        appointmentsTrend: '0 para hoje'
    });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publicUrl, setPublicUrl] = useState('');

    useEffect(() => {
        try {
            const u = localStorage.getItem('user');
            if (u) {
                const parsedUser = JSON.parse(u);
                setUser(parsedUser);
                if (parsedUser.role === 'ADMIN' || parsedUser.role === 'BARBER') {
                    fetchData();
                } else {
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error parsing user data:', err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const origin = window.location.origin;
        const slug = user.barbershop?.slug || user.ownedBarbershops?.[0]?.slug;
        if (slug) {
            setPublicUrl(`${origin}/${slug}`);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const userObj = JSON.parse(userStr);
            const bId = userObj.barbershopId || userObj.barbershop?.id || userObj.ownedBarbershops?.[0]?.id;

            // 1. Fetch Stats
            try {
                const statsRes = await api.get('/dashboard/stats');
                setTodayStats({
                    revenue: statsRes.data.revenueToday || 0,
                    appointments: statsRes.data.appointmentsToday || 0,
                    newClients: statsRes.data.newClientsToday || 0,
                    revenueTrend: statsRes.data.revenueTrend || '0% vs ontem',
                    appointmentsTrend: `${statsRes.data.appointmentsToday || 0} para hoje`
                });
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }

            // 2. Fetch Today's Appointments
            const today = new Date().toISOString().split('T')[0];
            const appRes = await api.get(`/appointments`, {
                params: {
                    barbershopId: bId,
                    start: `${today}T00:00:00.000Z`,
                    end: `${today}T23:59:59.999Z`
                }
            });
            setAppointments(appRes.data || []);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-500 font-bold uppercase text-xs animate-pulse">Carregando painel...</div>;

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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-[2rem] border border-border shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                        Olá, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Aqui está o resumo da sua barbearia hoje.
                    </p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-4 py-2 bg-background/50 backdrop-blur-md rounded-xl border border-border flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Sistema Online</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-background/50 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/50 rounded-xl transition-all group"
                    >
                        <RefreshCw className={`w-4 h-4 text-muted-foreground group-hover:text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                {/* Decorative BG Gradient */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Faturamento Hoje"
                    value={todayStats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={DollarSign}
                    trend={todayStats.revenueTrend}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatsCard
                    title="Agendamentos"
                    value={todayStats.appointments}
                    icon={Calendar}
                    trend={todayStats.appointmentsTrend}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatsCard
                    title="Clientes Novos"
                    value={todayStats.newClients}
                    icon={Users}
                    trend="Nesta semana"
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
                <StatsCard
                    title="Ticket Médio"
                    value="R$ 85,00"
                    icon={TrendingUp}
                    trend="Estável"
                    color="text-orange-500"
                    bg="bg-orange-500/10"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="md:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-foreground">Agenda de Hoje</h2>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Próximos atendimentos</p>
                        </div>
                        <a href="/dashboard/schedule" className="p-3 bg-background hover:bg-emerald-500 hover:text-white rounded-xl transition-all group-hover:scale-110">
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {loading ? (
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest animate-pulse">Carregando agenda...</p>
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 mb-4 font-bold text-xs uppercase tracking-widest">Nenhum agendamento para hoje.</p>
                                <a href="/dashboard/schedule" className="text-emerald-500 font-bold text-xs uppercase tracking-widest hover:underline">
                                    Ver agenda completa
                                </a>
                            </div>
                        ) : (
                            appointments.slice(0, 3).map((apt, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-border hover:border-emerald-500/30 transition-all">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-card rounded-xl border border-border shadow-sm">
                                        <span className="text-xs font-bold text-emerald-500">{new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">{apt.client?.name || apt.guestName || 'Cliente'}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{apt.service?.name} • {apt.professional?.name}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {apt.status === 'COMPLETED' ? 'Concluído' : 'Confirmado'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Scissors className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">Novo Agendamento</h3>
                    <p className="text-muted-foreground text-xs mb-8 leading-relaxed max-w-[200px]">
                        Adicione um cliente na agenda rapidamente sem sair daqui.
                    </p>
                    <Link href="/dashboard/schedule" className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:shadow-emerald-500/20">
                        Agendar Agora
                    </Link>
                </div>
            </div>

            {/* Performance & Marketing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card p-10 rounded-[2.5rem] border border-border relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-foreground">Desempenho</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-muted-foreground">Meta Mensal</span>
                                    <span className="text-foreground">75%</span>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Você está indo muito bem! Faltam apenas <span className="text-purple-400 font-bold">R$ 1.250,00</span> para bater sua meta de faturamento.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-10 rounded-[2.5rem] border border-border relative group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-foreground">Marketing Rápido</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-background rounded-2xl border border-border hover:border-emerald-500/50 transition-all group/btn text-left">
                            <MessageCircle className="w-5 h-5 text-emerald-500 mb-3" />
                            <p className="text-xs font-bold text-foreground mb-1">Promoção WhatsApp</p>
                            <p className="text-[10px] text-muted-foreground">Enviar oferta relâmpago</p>
                        </button>
                        <button className="p-4 bg-background rounded-2xl border border-border hover:border-blue-500/50 transition-all group/btn text-left">
                            <Instagram className="w-5 h-5 text-blue-500 mb-3" />
                            <p className="text-xs font-bold text-foreground mb-1">Stories Insta</p>
                            <p className="text-[10px] text-muted-foreground">Gerar arte do dia</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-6 rounded-3xl border border-border hover:border-emerald-500/50 transition-all">
                    <Settings className="w-6 h-6 text-slate-500 mb-4" />
                    <p className="font-bold text-foreground">Ajustes</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border hover:border-emerald-500/50 transition-all">
                    <Users className="w-6 h-6 text-slate-500 mb-4" />
                    <p className="font-bold text-foreground">Equipe</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border hover:border-emerald-500/50 transition-all">
                    <Star className="w-6 h-6 text-slate-500 mb-4" />
                    <p className="font-bold text-foreground">Avaliações</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border hover:border-emerald-500/50 transition-all">
                    <QrCode className="w-6 h-6 text-slate-500 mb-4" />
                    <p className="font-bold text-foreground">Pix QR</p>
                </div>
            </div>

            {stats.appointments === 0 && (
                <div className="bg-emerald-500/5 p-12 rounded-[3.5rem] border-4 border-dashed border-border text-center">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-4">Primeiros Passos...</h2>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-10">Configure seus serviços e comece a faturar hoje mesmo.</p>
                        <a href="/dashboard/services" className="inline-block bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-2xl shadow-emerald-500/40">
                            Cadastrar Meus Serviços
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, trend, color, bg }) {
    return (
        <div className="bg-card p-6 rounded-3xl border border-border hover:border-emerald-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg">
                    {trend}
                </span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-foreground">{value}</h3>
        </div>
    );
}
