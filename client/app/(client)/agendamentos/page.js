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
    const router = useRouter();

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
            <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] to-black text-white px-5 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center mb-8 relative">
                    <AlertCircle className="w-10 h-10 text-primary" />
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20"></div>
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Acesso Restrito</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mb-8">Faça login para gerenciar seus horários agendados.</p>
                <button
                    onClick={openLoginModal}
                    className="px-12 py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary/90 transition shadow-xl shadow-primary/20"
                >
                    Entrar Agora
                </button>
            </div>
        );
    }

    // Filters and Logic...
    const filteredByShop = filterShop === 'ALL' ? appointments : appointments.filter(a => a.barbershopId === filterShop);
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const scheduled = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        const isActive = ['PENDING', 'CONFIRMED', 'SCHEDULED', 'PENDING_PAYMENT'].includes(a.status);
        return isActive && appDate >= startOfToday;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const completed = filteredByShop.filter(a => {
        const appDate = new Date(a.date);
        return a.status === 'COMPLETED' || (['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(a.status) && appDate < startOfToday);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const cancelled = filteredByShop.filter(a => ['CANCELLED', 'NO_SHOW'].includes(a.status)).sort((a, b) => new Date(b.date) - new Date(a.date));
    const listToShow = activeTab === 'scheduled' ? scheduled : activeTab === 'completed' ? completed : cancelled;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-6 pb-24 font-sans no-scrollbar">

            {/* Header */}
            <header className="flex items-center justify-between mb-8 px-1">
                <div>
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Agenda</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Seus horários marcados</p>
                </div>
                <div className="relative">
                    <button className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-slate-400">
                        <Filter className="w-5 h-5" />
                    </button>
                    {/* Select hidden over the button for native experience or custom dropdown */}
                    <select
                        value={filterShop}
                        onChange={(e) => setFilterShop(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                        <option value="ALL">Todos os locais</option>
                        {shops.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* TABS (PREMIUM) */}
            <div className="flex items-center gap-2 mb-8 glass-premium p-1.5 rounded-2xl">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'scheduled' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                >
                    Próximos
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'completed' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                >
                    Histórico
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-white'}`}
                >
                    Cancelados
                </button>
            </div>

            {/* List */}
            <div className="space-y-6 px-1">
                {listToShow.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center mb-6 relative">
                            <Calendar className="w-8 h-8 text-slate-700" strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">Nada por aqui</h3>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto mb-8">Parece que você ainda não tem registros nesta categoria.</p>
                        {activeTab === 'scheduled' && (
                            <button onClick={() => router.push('/search')} className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                Novo Agendamento
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {listToShow.map(app => (
                            <AppointmentCard key={app.id} app={app} onCancel={handleCancel} showCancel={activeTab === 'scheduled'} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AppointmentCard({ app, onCancel, showCancel }) {
    const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
    const isPendingPayment = app.status === 'PENDING_PAYMENT';
    
    return (
        <div className={`glass-premium p-6 rounded-[2.5rem] border-white/5 relative group transition-all active:scale-[0.99] overflow-hidden`}>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 ${isCancelled ? 'bg-red-500' : 'bg-primary'}`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 glass-premium rounded-2xl flex flex-col items-center justify-center border-white/10 shadow-inner">
                        <span className="text-xl font-black text-white leading-none">{new Date(app.date).getDate()}</span>
                        <span className={`text-[8px] uppercase font-black tracking-widest ${isCancelled ? 'text-red-500' : 'text-primary'} mt-0.5`}>
                            {new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-black text-base text-white group-hover:text-primary transition-colors uppercase tracking-tight">{app.service?.name}</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3" /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isCancelled ? 'bg-red-500/10 text-red-500' : isPendingPayment ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'} border border-white/5`}>
                    {app.status === 'PENDING' ? 'Aguardando' : app.status === 'CONFIRMED' ? 'Confirmado' : isCancelled ? 'Cancelado' : isPendingPayment ? 'Pgto Pendente' : 'Concluído'}
                </div>
            </div>

            <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 glass-premium rounded-xl flex items-center justify-center text-primary">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Local</p>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{app.barbershop?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 glass-premium rounded-xl flex items-center justify-center text-primary">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Profissional</p>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{app.professional?.name}</p>
                    </div>
                </div>
            </div>

            {showCancel && (
                <button
                    onClick={() => onCancel(app.id)}
                    className="w-full py-4 rounded-2xl glass-premium border-red-500/10 text-red-500 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative z-10"
                >
                    <XCircle className="w-3.5 h-3.5" /> Cancelar Horário
                </button>
            )}
        </div>
    );
}
