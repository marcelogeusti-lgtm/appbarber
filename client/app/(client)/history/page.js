'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function HistoryPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/appointments/me');
            setAppointments(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-slate-500">Carregando...</div>;

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white font-sans pb-24">
            <header className="p-6 sticky top-0 bg-[#0a0f1a]/80 backdrop-blur-md z-10 flex items-center gap-4 border-b border-slate-800/50">
                <Link href="/home" className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </Link>
                <h1 className="text-lg font-black uppercase tracking-wider">Histórico</h1>
            </header>

            <div className="p-6 space-y-4">
                {appointments.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-medium">Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="bg-[#111827] border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{app.service?.name}</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{app.barbershop?.name}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                    {app.status === 'COMPLETED' ? 'Concluído' : app.status === 'CANCELLED' ? 'Cancelado' : 'Agendado'}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            {app.barbershop?.slug && (
                                <Link
                                    href={`/agendamento/${app.barbershop.slug}`}
                                    className="block w-full bg-slate-900 text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition"
                                >
                                    Reagendar
                                </Link>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
