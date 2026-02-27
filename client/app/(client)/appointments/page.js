'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, XCircle, Loader2, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../lib/clientApi';

export default function HistoryPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterShop, setFilterShop] = useState('ALL');
    const [shops, setShops] = useState([]);
    const [activeTab, setActiveTab] = useState('scheduled'); // scheduled, completed, cancelled

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

    // 1. First, Apply Shop Filter
    const filteredByShop = filterShop === 'ALL'
        ? appointments
        : appointments.filter(a => a.barbershopId === filterShop);

    // 2. Then, bucket them for Tabs
    const now = new Date();
    // Set to start of day for safer comparison if we want to show everything from today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const scheduled = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        return (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'SCHEDULED') &&
            appDate >= today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ascending for upcoming

    const completed = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        return a.status === 'COMPLETED' ||
            ((a.status === 'PENDING' || a.status === 'CONFIRMED') && appDate < today);
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending for history

    const cancelled = filteredByShop.filter(a =>
        a.status === 'CANCELLED' || a.status === 'NO_SHOW'
    ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending for history

    // 3. Determine what to show based on Active Tab
    const listToShow = activeTab === 'scheduled' ? scheduled : activeTab === 'completed' ? completed : cancelled;

    return (
        <div className="min-h-screen bg-[#0F111A] text-white font-sans p-6 md:p-12 max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">Meus Agendamentos</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie seus horários e histórico</p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative w-full md:w-64">
                    <select
                        value={filterShop}
                        onChange={(e) => setFilterShop(e.target.value)}
                        className="w-full bg-[#151821] text-white text-sm font-medium p-4 rounded-xl border border-white/10 outline-none appearance-none cursor-pointer focus:border-emerald-500 transition"
                    >
                        <option value="ALL">Todas Barbearias</option>
                        {shops.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* TABS HEADER */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`px-6 py-3 rounded-t-xl text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'scheduled' ? 'text-emerald-500 bg-[#151821] border-b-2 border-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Agendados
                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] ml-1">{scheduled.length}</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 rounded-t-xl text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'completed' ? 'text-emerald-500 bg-[#151821] border-b-2 border-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Concluídos
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-6 py-3 rounded-t-xl text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'cancelled' ? 'text-red-500 bg-[#151821] border-b-2 border-red-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Cancelados
                    </div>
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-6">
                {listToShow.length === 0 ? (
                    // Empty State for specific tab
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                        <div className="w-24 h-24 bg-[#151821] rounded-full flex items-center justify-center mb-6">
                            {activeTab === 'scheduled' ? <Calendar className="w-8 h-8 text-slate-600" /> :
                                activeTab === 'completed' ? <CheckCircle className="w-8 h-8 text-slate-600" /> :
                                    <XCircle className="w-8 h-8 text-slate-600" />}
                        </div>
                        <p className="text-slate-400 font-medium">
                            {activeTab === 'scheduled' ? 'Você não tem agendamentos futuros.' :
                                activeTab === 'completed' ? 'Nenhum histórico de serviços concluídos.' :
                                    'Nenhum agendamento cancelado.'}
                        </p>
                        {activeTab === 'scheduled' && (
                            <Link href="/search" className="mt-6 px-8 py-3 bg-emerald-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition">
                                Novo Agendamento
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {listToShow.map(app => (
                            <AppointmentCard
                                key={app.id}
                                app={app}
                                onCancel={handleCancel}
                                showCancel={activeTab === 'scheduled'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Subcomponent for Card
function AppointmentCard({ app, onCancel, showCancel }) {
    const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
    const isCompleted = app.status === 'COMPLETED';
    const accentColor = isCancelled ? 'red' : isCompleted ? 'emerald' : 'blue';

    return (
        <div className={`bg-[#151821] rounded-[2rem] p-6 border transition-all group ${isCancelled ? 'border-red-500/10 hover:border-red-500/30' :
            isCompleted ? 'border-emerald-500/10 hover:border-emerald-500/30' :
                'border-blue-500/10 hover:border-blue-500/30'
            }`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-[#0F111A] rounded-2xl flex flex-col items-center justify-center border border-white/5`}>
                        <span className="text-2xl font-black text-white">{new Date(app.date).getDate()}</span>
                        <span className={`text-[10px] uppercase font-bold text-${accentColor}-500`}>{new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg text-white group-hover:text-${accentColor}-500 transition-colors`}>{app.service?.name}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === 'CONFIRMED' || app.status === 'PENDING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                    {app.status === 'PENDING' ? 'Agendado' : app.status === 'CONFIRMED' ? 'Confirmado' : app.status === 'CANCELLED' ? 'Cancelado' : 'Concluído'}
                </span>
            </div>

            <div className="space-y-3 mb-6 bg-[#0F111A] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                    <User className={`w-4 h-4 text-${accentColor}-500`} />
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Profissional</p>
                        <p className="text-sm font-bold text-white">{app.professional?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 text-${accentColor}-500`} />
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Local</p>
                        <p className="text-sm font-bold text-white">{app.barbershop?.name}</p>
                    </div>
                </div>
            </div>

            {showCancel && (
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
