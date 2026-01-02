'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Scissors, User, XCircle, RefreshCw, Loader2, Check } from 'lucide-react';
import api from '../../../lib/api';

export default function HistoryPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/me');
            setAppointments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Tem certeza que deseja cancelar?')) return;
        try {
            await api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' });
            fetchAppointments();
        } catch (error) {
            alert('Erro ao cancelar agendamento');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
    );

    const upcoming = appointments.filter(a => new Date(a.date) > new Date() && a.status !== 'CANCELLED');
    const past = appointments.filter(a => new Date(a.date) <= new Date() || a.status === 'CANCELLED');

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
            {/* Header */}
            <header className="p-6 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 flex items-center gap-4 border-b border-slate-900">
                <h1 className="text-xl font-black uppercase tracking-tight">Meus Agendamentos</h1>
            </header>

            <div className="p-6 space-y-8">
                {/* Upcoming */}
                <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Próximos
                    </h2>

                    <div className="space-y-4">
                        {upcoming.map(app => (
                            <div key={app.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-white">
                                            {new Date(app.date).getDate()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase">{new Date(app.date).toLocaleDateString('pt-BR', { month: 'long', weekday: 'short' })}</p>
                                            <p className="text-2xl font-black text-white leading-none">{new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        Confirmado
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Scissors className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium text-white">{app.service?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <User className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium">{app.professional?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium">{app.barbershop?.name}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCancel(app.id)}
                                    className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Cancelar Horário
                                </button>
                            </div>
                        ))}
                        {upcoming.length === 0 && (
                            <p className="text-slate-600 text-sm italic">Você não tem agendamentos futuros.</p>
                        )}
                    </div>
                </div>

                {/* History */}
                <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div> Histórico
                    </h2>

                    <div className="space-y-4 opacity-75">
                        {past.map(app => (
                            <div key={app.id} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50 flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white line-through decoration-slate-600 decoration-2">{app.service?.name}</p>
                                        <p className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {app.status === 'CANCELLED' ? (
                                        <span className="text-[10px] uppercase font-black text-red-500 bg-red-500/10 px-2 py-1 rounded">Cancelado</span>
                                    ) : (
                                        <span className="text-[10px] uppercase font-black text-slate-500 bg-slate-800 px-2 py-1 rounded">Concluído</span>
                                    )}
                                </div>
                                {app.status !== 'CANCELLED' && (
                                    <button className="text-orange-500 text-xs font-black uppercase tracking-widest hover:text-orange-400 transition flex items-center gap-2">
                                        <RefreshCw className="w-3 h-3" /> Agendar Novamente
                                    </button>
                                )}
                            </div>
                        ))}
                        {past.length === 0 && (
                            <p className="text-slate-600 text-sm italic">Nenhum histórico encontrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
