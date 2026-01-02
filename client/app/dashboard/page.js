'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Olá, {user.name}! 👋</h1>
                <div className="flex gap-3">
                    <a href="/home" className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold border border-slate-700 hover:bg-slate-800 transition flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Ver como Cliente
                    </a>
                    <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-bold border border-orange-500/20">
                        {user.role === 'SUPER_ADMIN' ? '👑 Super Admin' : user.role === 'ADMIN' ? '🏢 Administrador' : '✂️ Profissional'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11 17l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Seu Link de Agendamento Público</h3>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-sm text-orange-500 break-all">
                                {publicUrl || 'Carregando link...'}
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                                >
                                    COPIAR LINK
                                </button>
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    className="flex-1 md:flex-none border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition text-center"
                                >
                                    ABRIR
                                </a>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 uppercase">Compartilhe este link no seu Instagram ou WhatsApp para receber agendamentos.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Agendamentos para Hoje</h3>
                    <p className="text-5xl font-black text-orange-500">{stats.today || 0}</p>
                    <p className="text-xs text-slate-400 mt-2">Clientes agendados nas próximas 24h</p>
                </div>
            </div>

            {/* Client Flow Guide */}
            <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Como funciona o fluxo do seu cliente? ✂️</h2>
                    <p className="text-orange-100 font-medium mb-6 leading-relaxed">
                        Esqueça cadastros chatos! No **Barbe-On**, seu cliente só informa o nome e telefone na primeira vez. Nós cuidamos do resto para que o agendamento seja feito em menos de 1 minuto.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Passo 1</p>
                            <p className="text-xs font-bold leading-tight">Cliente acessa seu link público</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Passo 2</p>
                            <p className="text-xs font-bold leading-tight">Escolhe o serviço e o horário</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Passo 3</p>
                            <p className="text-xs font-bold leading-tight">Confirma e pronto! Simples assim.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Ganhos em Agendamentos</h3>
                    <p className="text-4xl font-black text-green-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Soma total dos serviços realizados</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Base de Clientes</h3>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.clients}</p>
                    <p className="text-xs text-slate-400 mt-2">Clientes únicos agendados</p>
                </div>
            </div>

            {stats.appointments === 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center py-12">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-2">Sua barbearia está quase pronta!</h2>
                        <p className="text-slate-500 mb-6">Comece cadastrando seus serviços e horários para que os clientes possam agendar.</p>
                        <div className="flex gap-4 justify-center">
                            <a href="/dashboard/services" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition">Configurar Serviços</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
