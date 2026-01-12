'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Scissors, User, XCircle, RefreshCw, Loader2, Check, Filter } from 'lucide-react';
import api from '../../../lib/api';

export default function HistoryPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterShop, setFilterShop] = useState('ALL');
    const [shops, setShops] = useState([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/me');
            setAppointments(res.data);

            // Extract unique shops for filter
            const shopMap = new Map();
            res.data.forEach(app => {
                if (app.barbershop) shopMap.set(app.barbershop.id, app.barbershop.name);
            });
            setShops(Array.from(shopMap.entries()));

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
        <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
    );

    const filteredAppointments = filterShop === 'ALL'
        ? appointments
        : appointments.filter(a => a.barbershopId === filterShop);

    const upcoming = filteredAppointments.filter(a => new Date(a.date) > new Date() && a.status !== 'CANCELLED');
    const past = filteredAppointments.filter(a => new Date(a.date) <= new Date() || a.status === 'CANCELLED');

    return (
        <div className="min-h-screen bg-[#0F111A] text-white font-sans p-6 md:p-12 max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-white">Meus Agendamentos</h1>

                {/* Filter Dropdown */}
                <div className="relative w-full md:w-64">
                    <select
                        value={filterShop}
                        onChange={(e) => setFilterShop(e.target.value)}
                        className="w-full bg-[#151821] text-white text-sm font-medium p-4 rounded-xl border border-white/10 outline-none appearance-none cursor-pointer focus:border-emerald-500 transition"
                    >
                        <option value="ALL">Filtrar por estabelecimento</option>
                        {shops.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-12">
                {upcoming.length === 0 && past.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-80">
                        <div className="w-40 h-40 bg-[#151821] rounded-full flex items-center justify-center mb-8 relative">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <div className="absolute bottom-2 right-2 bg-emerald-500 p-2 rounded-full shadow-lg">
                                <SearchIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium">Nenhum agendamento encontrado em aberto.</p>
                        <Link href="/search" className="mt-6 px-8 py-3 bg-emerald-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition">
                            Agendar Agora
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Section */}
                        {upcoming.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-l-4 border-emerald-500 pl-3">Em Aberto</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {upcoming.map(app => (
                                        <AppointmentCard key={app.id} app={app} onCancel={handleCancel} isUpcoming />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History Section */}
                        {past.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-l-4 border-slate-700 pl-3">Histórico</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                                    {past.map(app => (
                                        <AppointmentCard key={app.id} app={app} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Subcomponent for Card
function AppointmentCard({ app, onCancel, isUpcoming }) {
    return (
        <div className="bg-[#151821] rounded-[2rem] p-6 border border-white/5 hover:border-emerald-500/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#0F111A] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                        <span className="text-2xl font-black text-white">{new Date(app.date).getDate()}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-500">{new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-500 transition-colors">{app.service?.name}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === 'CONFIRMED' || app.status === 'PENDING' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-slate-700/30 text-slate-400 border-slate-700/50'
                    }`}>
                    {app.status === 'PENDING' ? 'Agendado' : app.status === 'CONFIRMED' ? 'Confirmado' : app.status === 'CANCELLED' ? 'Cancelado' : 'Concluído'}
                </span>
            </div>

            <div className="space-y-3 mb-6 bg-[#0F111A] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-emerald-500" />
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Profissional</p>
                        <p className="text-sm font-bold text-white">{app.professional?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Local</p>
                        <p className="text-sm font-bold text-white">{app.barbershop?.name}</p>
                    </div>
                </div>
            </div>

            {isUpcoming && (
                <button
                    onClick={() => onCancel(app.id)}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <XCircle className="w-4 h-4" /> Cancelar Agendamento
                </button>
            )}
        </div>
    )
}

function SearchIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    )
}
