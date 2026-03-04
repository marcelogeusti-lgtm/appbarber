'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User as UserIcon, XCircle, Loader2, Filter, CheckCircle, AlertCircle, ChevronDown, Search } from 'lucide-react';
import api from '../../../lib/clientApi';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

export default function HistoryPage() {
    const { user, loading: authLoading, openLoginModal } = useClientAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterShop, setFilterShop] = useState('ALL');
    const [shops, setShops] = useState([]);
    const [activeTab, setActiveTab] = useState('scheduled'); // scheduled, completed, cancelled

    useEffect(() => {
        if (!authLoading && user) {
            fetchAppointments();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

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

    if (authLoading || (user && loading)) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                    <div className="relative flex items-center justify-center w-full h-full bg-[#111] border border-white/5 rounded-full shadow-2xl">
                        <AlertCircle className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Acesso Restrito</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">Você precisa estar logado para visualizar seus agendamentos.</p>
                <button
                    onClick={openLoginModal}
                    className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary/90 transition shadow-xl shadow-primary/20"
                >
                    Fazer Login
                </button>
            </div>
        );
    }

    // 1. First, Apply Shop Filter
    const filteredByShop = filterShop === 'ALL'
        ? appointments
        : appointments.filter(a => a.barbershopId === filterShop);

    // 2. Then, bucket them for Tabs
    const now = new Date();
    // Start of today in local time for comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const scheduled = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        // Upcoming: Status is active AND (is today or in the future)
        const isActiveStatus = ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(a.status);
        const isTodayOrFuture = appDate >= startOfToday;

        return isActiveStatus && isTodayOrFuture;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const completed = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        // Completed: Explicit status OR (is active status but date has passed)
        const isExplicitlyCompleted = a.status === 'COMPLETED';
        const isPastActive = ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(a.status) && appDate < startOfToday;

        return isExplicitlyCompleted || isPastActive;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const cancelled = filteredByShop.filter(a =>
        ['CANCELLED', 'NO_SHOW'].includes(a.status)
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    // 3. Determine what to show based on Active Tab
    const listToShow = activeTab === 'scheduled' ? scheduled : activeTab === 'completed' ? completed : cancelled;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 lg:max-w-none mx-auto pb-32">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Meus Agendamentos</h1>
                </div>

                {/* Filter Dropdown */}
                <div className="relative w-full md:w-80">
                    <select
                        value={filterShop}
                        onChange={(e) => setFilterShop(e.target.value)}
                        className="w-full bg-[#111] text-white text-xs font-bold uppercase tracking-widest p-4 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer focus:border-primary transition shadow-xl"
                    >
                        <option value="ALL">Filtrar por estabelecimento</option>
                        {shops.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* TABS HEADER */}
            <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar border-b border-white/5">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'scheduled' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    Agendados
                    {scheduled.length > 0 && (
                        <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">{scheduled.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    Concluídos
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'cancelled' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500 hover:text-white'}`}
                >
                    Cancelados
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-6">
                {listToShow.length === 0 ? (
                    // Empty State for specific tab (SaaS Style)
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                            <div className="relative flex items-center justify-center w-full h-full bg-[#111] border border-white/5 rounded-full shadow-2xl">
                                <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 12.5l2 2m0-2l-2 2" />
                                </svg>
                                <div className="absolute -bottom-1 -right-1 p-2 bg-primary/10 border border-primary/20 rounded-full">
                                    <Search className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                            {activeTab === 'scheduled' ? 'Nenhum agendamento em aberto' :
                                activeTab === 'completed' ? 'Nenhum histórico de serviços' :
                                    'Nenhum agendamento cancelado'}
                        </p>
                        {activeTab === 'scheduled' && (
                            <Link href="/search" className="mt-8 px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary/90 transition shadow-xl shadow-primary/20">
                                Novo Agendamento
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
    const accentColor = isCancelled ? 'red' : isCompleted ? 'primary' : 'primary';

    return (
        <div className={`bg-[#111] rounded-[2.5rem] p-8 border transition-all group ${isCancelled ? 'border-red-500/10 hover:border-red-500/30' : 'border-white/5 hover:border-primary/30'}`}>
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#0A0A0A] rounded-3xl flex flex-col items-center justify-center border border-white/5 shadow-inner">
                        <span className="text-3xl font-black text-white">{new Date(app.date).getDate()}</span>
                        <span className={`text-[10px] uppercase font-black tracking-widest text-${accentColor}`}>
                            {new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-white group-hover:text-primary transition-colors uppercase tracking-tight">{app.service?.name}</h3>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {app.status === 'PENDING' ? 'Agendado' : app.status === 'CONFIRMED' ? 'Confirmado' : app.status === 'CANCELLED' ? 'Cancelado' : 'Concluído'}
                </span>
            </div>

            <div className="space-y-4 mb-8 bg-[#0A0A0A] p-6 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl">
                        <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Profissional</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{app.professional?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl">
                        <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Estabelecimento</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{app.barbershop?.name}</p>
                    </div>
                </div>
            </div>

            {showCancel && (
                <button
                    onClick={() => onCancel(app.id)}
                    className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <XCircle className="w-4 h-4" /> Cancelar Horário
                </button>
            )}
        </div>
    )
}
