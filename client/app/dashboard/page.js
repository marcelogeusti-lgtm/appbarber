'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, revenue: 0, clients: 0 });

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsedUser = JSON.parse(u);
            setUser(parsedUser);
            if (parsedUser.role === 'ADMIN' || parsedUser.role === 'BARBER') {
                fetchStats();
            }
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/appointments/pro');
            setStats({
                appointments: res.data.length,
                revenue: res.data.reduce((acc, curr) => acc + (curr.service.price || 0), 0),
                clients: new Set(res.data.map(a => a.clientId)).size
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    if (!user) return <div className="p-8 text-center">Carregando...</div>;

    const publicUrl = user?.barbershop?.slug
        ? `https://www.barbeon.com/agendamento/${user.barbershop.slug}`
        : user?.ownedBarbershops?.[0]?.slug
            ? `https://www.barbeon.com/agendamento/${user.ownedBarbershops[0].slug}`
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
                <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-bold border border-orange-500/20">
                    {user.role === 'SUPER_ADMIN' ? '👑 Super Admin' : user.role === 'ADMIN' ? '🏢 Administrador' : '✂️ Profissional'}
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
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Próximos Agendamentos</h3>
                    <p className="text-5xl font-black text-orange-500">{stats.appointments}</p>
                    <p className="text-xs text-slate-400 mt-2">Hoje e amanhã</p>
                </div>
            </div>

            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Faturamento Bruto</h3>
                        <p className="text-4xl font-black text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Total acumulado garantido</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Base de Clientes</h3>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.clients}</p>
                        <p className="text-xs text-slate-400 mt-2">Clientes únicos agendados</p>
                    </div>
                </div>
            )}

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
