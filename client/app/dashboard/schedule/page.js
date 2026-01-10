'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Calendar as CalendarIcon, Clock, User, Scissors, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, PlusCircle, AlertCircle } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SqueezeInModal from '../../../components/SqueezeInModal';
import DayDetailsModal from '../../../components/DayDetailsModal';
import NewOrderModal from '../../../components/NewOrderModal'; // Assuming we might reuse this for the actual creation if needing payments, but SqueezeIn confirms directly for now.

export default function SchedulePage() {
    const [appointments, setAppointments] = useState([]);
    const [waitlist, setWaitlist] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]); // New Services State
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day');
    const [activeTab, setActiveTab] = useState('appointments');

    // Modals State
    const [isSqueezeInOpen, setIsSqueezeInOpen] = useState(false);
    const [dayDetailsDate, setDayDetailsDate] = useState(null); // If set, modal is open

    useEffect(() => {
        fetchData();
        fetchWaitlist();
    }, [selectedPro, currentDate]); // Refetch when Pro/Date changes

    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            // Appointments
            const appRes = await api.get(`/appointments?barbershopId=${bId}`);
            setAppointments(appRes.data);

            // Professionals (only once ideally, but here for safety)
            if (professionals.length === 0) {
                const proRes = await api.get(`/professionals?barbershopId=${bId}`);
                setProfessionals(proRes.data);
            }

            // Services (for Squeeze In)
            if (services.length === 0) {
                const srvRes = await api.get(`/services?barbershopId=${bId}&active=true`);
                setServices(srvRes.data);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSqueezeInConfirm = async (bookingData) => {
        try {
            await api.post('/appointments', bookingData);
            alert('Encaixe realizado com sucesso!');
            fetchData(); // Refresh calendar
        } catch (error) {
            console.error(error);
            alert('Erro ao realizar encaixe: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchWaitlist = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/waitlist`, {
                params: {
                    barbershopId: bId,
                    date: currentDate.toISOString(),
                    professionalId: selectedPro
                }
            });
            setWaitlist(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const next = () => {
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const prev = () => {
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const getFilteredAppointments = (date) => {
        const dStr = format(date, 'yyyy-MM-dd');
        return appointments.filter(a => {
            const sameDay = a.date.startsWith(dStr);
            const samePro = selectedPro === 'all' || a.professionalId === selectedPro;
            return sameDay && samePro;
        });
    };

    const handleSqueezeIn = async () => {
        // Simple prompt based squeeze-in for now or open modal
        // Ideally reuse a Global Booking Modal with preset data
        alert("Para realizar um encaixe, utilize o botão 'Novo Agendamento' no menu lateral e marque a opção 'Encaixe' (se disponível) ou apenas force o horário.");
    };

    if (loading && professionals.length === 0) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Sincronizando agenda...</div>;

    const selectedProData = professionals.find(p => p.id === selectedPro);

    return (
        <div className="space-y-6 pb-20 text-slate-300">
            {/* Header Redesign */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10 w-full xl:w-auto">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Agenda Operacional</h1>

                    {/* Professional Selector (Dropdown) */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <select
                                value={selectedPro}
                                onChange={(e) => setSelectedPro(e.target.value)}
                                className="appearance-none bg-slate-950 text-white pl-12 pr-12 py-4 rounded-2xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-900 transition min-w-[280px]"
                            >
                                <option value="all">Todos Profissionais</option>
                                {professionals.map(pro => (
                                    <option key={pro.id} value={pro.id}>{pro.name}</option>
                                ))}
                            </select>
                            <User className="w-5 h-5 text-emerald-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                                ▼
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
                            <button onClick={prev} className="p-2 hover:bg-[#111827] rounded-xl transition shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                            <div className="px-4 text-center min-w-[140px]">
                                <p className="font-black text-xs text-white uppercase tracking-widest">
                                    {viewMode === 'day' ? format(currentDate, 'dd MMMM', { locale: ptBR }) :
                                        viewMode === 'week' ? `Semana ${format(startOfWeek(currentDate), 'dd/MM')}` :
                                            format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                </p>
                            </div>
                            <button onClick={next} className="p-2 hover:bg-[#111827] rounded-xl transition shadow-sm"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto relative z-10">

                    {/* View Mode */}
                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
                        {['day', 'week', 'month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-[#111827] text-emerald-500 shadow-xl border border-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    {/* Squeeze In Button */}
                    <button
                        onClick={() => setIsSqueezeInOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 text-[#111827] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl shadow-white/5"
                    >
                        <PlusCircle className="w-4 h-4" /> Encaixe Rápido
                    </button>
                </div>
            </header>

            {/* Tabs Navigation (Only for Day View & Specific Pro preferably, but valid generally) */}
            <div className="flex items-center gap-4 border-b border-slate-800/50 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'appointments' ? 'text-emerald-500 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Agendamentos
                </button>
                <button
                    onClick={() => setActiveTab('waitlist')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'waitlist' ? 'text-emerald-500 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Lista de Espera
                    {waitlist.length > 0 && <span className="bg-emerald-500 text-[#111827] px-1.5 py-0.5 rounded text-[9px]">{waitlist.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'availability' ? 'text-emerald-500 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Horários Livres
                </button>
            </div>

            <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[600px]">
                {activeTab === 'appointments' && (
                    <>
                        {viewMode === 'day' && <DayView appointments={getFilteredAppointments(currentDate)} professionals={professionals} selectedPro={selectedPro} />}
                        {viewMode === 'week' && <WeekView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} onDayClick={setDayDetailsDate} />}
                        {viewMode === 'month' && <MonthView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} onDayClick={setDayDetailsDate} />}
                    </>
                )}

                {activeTab === 'waitlist' && (
                    <WaitlistView waitlist={waitlist} professionals={professionals} />
                )}

                {activeTab === 'availability' && (
                    <div className="p-20 text-center">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Visualização de horários livres em desenvolvimento.</p>
                    </div>
                )}
            </div>

            <SqueezeInModal
                isOpen={isSqueezeInOpen}
                onClose={() => setIsSqueezeInOpen(false)}
                services={services}
                barbershopId={localStorage.getItem('user') ? (JSON.parse(localStorage.getItem('user')).barbershopId || JSON.parse(localStorage.getItem('user')).barbershop?.id || JSON.parse(localStorage.getItem('user')).ownedBarbershops?.[0]?.id) : null}
                onConfirm={handleSqueezeInConfirm}
            />

            <DayDetailsModal
                isOpen={!!dayDetailsDate}
                onClose={() => setDayDetailsDate(null)}
                date={dayDetailsDate || new Date()}
                appointments={dayDetailsDate ? getFilteredAppointments(dayDetailsDate) : []}
                professionals={professionals}
            />
        </div>
    );
}

function WaitlistView({ waitlist, professionals }) {
    if (waitlist.length === 0) return (
        <div className="py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700 shadow-inner">
                <Clock className="w-10 h-10" />
            </div>
            <div className="max-w-xs mx-auto">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Lista Vazia</h3>
                <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest mt-2 leading-relaxed">Nenhum cliente na lista de espera para este dia.</p>
            </div>
        </div>
    );

    return (
        <div className="divide-y divide-slate-800/50">
            {waitlist.map(entry => (
                <div key={entry.id} className="p-8 hover:bg-emerald-500/5 transition flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 font-black text-xl">
                            {entry.clientName?.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-white uppercase tracking-tight">{entry.clientName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-2">{entry.service?.name}</p>
                            <span className="bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                Aguardando desde {format(new Date(entry.createdAt), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                    <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                        Agendar
                    </button>
                </div>
            ))}
        </div>
    );
}

// ... Keep DayView, WeekView, MonthView, EmptyState as is (or include them below if replacing entire file)
// Since I am rewriting the file, I must include them.

function DayView({ appointments, professionals, selectedPro }) {
    if (appointments.length === 0) return <EmptyState />;
    return (
        <div className="divide-y divide-slate-800/50">
            {appointments.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => (
                <div key={app.id} className="p-8 hover:bg-emerald-500/5 transition flex flex-col md:flex-row items-start md:items-center gap-8 group">
                    <div className="text-center md:border-r border-slate-800 pr-8 min-w-[120px]">
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                            {format(new Date(app.date), 'HH:mm')}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-black uppercase mt-2 tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded">Confirmado</p>
                    </div>

                    <div className="flex-1 space-y-3 cursor-pointer" onClick={() => alert(`Detalhes do Agendamento:\nCliente: ${app.client?.name}\nServiço: ${app.service?.name}\nProfissional: ${app.professional?.name || 'N/A'}\nNotas: ${app.notes || 'Nenhuma'}`)}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 font-black group-hover:scale-110 transition-transform">
                                {app.client?.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tight text-white group-hover:text-emerald-500 transition-colors">{app.client?.name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> {app.client?.phone}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                                <Scissors className="w-3.5 h-3.5 text-emerald-500" /> {app.service?.name}
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
                                <User className="w-3.5 h-3.5 text-slate-600" /> {app.summaryProName || professionals.find(p => p.id === app.professionalId)?.name}
                            </span>
                            {app.isSqueezeIn && (
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
                                    Encaixe
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <a
                            href={`https://wa.me/55${app.client?.phone?.replace(/\D/g, '')}?text=Olá ${app.client?.name}! Confirmamos seu horário às ${format(new Date(app.date), 'HH:mm')} na Corte %26 Conexão.`}
                            target="_blank"
                            className="flex-1 md:flex-none bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20 text-center"
                        >
                            WhatsApp
                        </a>
                        <button
                            onClick={async () => {
                                if (confirm('Deseja realmente cancelar este agendamento?')) {
                                    try {
                                        await api.patch(`/appointments/${app.id}/status`, { status: 'CANCELLED' });
                                        window.location.reload();
                                    } catch (err) {
                                        alert('Erro ao cancelar agendamento');
                                    }
                                }
                            }}
                            className="flex-1 md:flex-none bg-slate-950 text-red-500 border border-slate-800 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition text-center"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function WeekView({ currentDate, getFilteredAppointments, professionals, selectedPro, onDayClick }) {
    const weekStart = startOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

    return (
        <div className="grid grid-cols-7 h-full border-collapse">
            {days.map((day, i) => {
                const dayApps = getFilteredAppointments(day);
                const isToday = isSameDay(day, new Date());
                return (
                    <div
                        key={i}
                        onClick={() => onDayClick(day)}
                        className={`min-h-[500px] border-r border-slate-800 flex flex-col cursor-pointer hover:bg-slate-800/20 transition ${isToday ? 'bg-emerald-500/5' : ''}`}
                    >
                        <div className="p-6 text-center border-b border-slate-800">
                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] mb-2">{format(day, 'EEE', { locale: ptBR })}</p>
                            <p className={`w-10 h-10 flex items-center justify-center mx-auto rounded-xl font-black text-sm tracking-tighter ${isToday ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-200 border border-slate-800 bg-slate-950'}`}>
                                {format(day, 'd')}
                            </p>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] scrollbar-hide py-4">
                            {dayApps.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => (
                                <div key={app.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all group group">
                                    <p className="font-black text-[11px] text-white leading-none tracking-widest">{format(new Date(app.date), 'HH:mm')}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-2 truncate group-hover:text-slate-300 transition-colors uppercase">{app.client?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase truncate tracking-tighter">{app.service?.name}</p>
                                    </div>
                                    {app.isSqueezeIn && <div className="mt-1 text-[8px] text-orange-500 uppercase font-black">Encaixe</div>}
                                </div>
                            ))}
                            {dayApps.length === 0 && (
                                <div className="h-full flex items-center justify-center opacity-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] -rotate-90 text-slate-700">Disponível</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthView({ currentDate, getFilteredAppointments, professionals, selectedPro, onDayClick }) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStart = startOfWeek(monthStart);
    const days = eachDayOfInterval({ start: weekStart, end: endOfMonth(monthEnd) });

    return (
        <div className="grid grid-cols-7 h-full">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="p-6 text-center border-b border-slate-800 bg-slate-950/20">
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">{d}</p>
                </div>
            ))}
            {days.map((day, i) => {
                const dayApps = getFilteredAppointments(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                return (
                    <div
                        key={i}
                        onClick={() => onDayClick(day)}
                        className={`min-h-[140px] p-4 border-r border-b border-slate-800 group hover:bg-emerald-500/5 transition-all cursor-pointer ${!isCurrentMonth ? 'opacity-10 bg-slate-950 pointer-events-none' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-[12px] font-black tracking-tighter ${isToday ? 'bg-emerald-500 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-lg shadow-emerald-500/20' : 'text-slate-600'}`}>
                                {format(day, 'd')}
                            </span>
                            {dayApps.length > 0 && (
                                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-500/20">
                                    {dayApps.length} Jobs
                                </span>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            {dayApps.slice(0, 3).map(app => (
                                <div key={app.id} className="text-[8px] bg-slate-950 px-2 py-1.5 rounded-lg font-black text-slate-400 truncate border border-slate-800 group-hover:border-emerald-500/30">
                                    <span className="text-emerald-500 font-mono">{format(new Date(app.date), 'HH:mm')}</span> {app.client?.name}
                                </div>
                            ))}
                            {dayApps.length > 3 && (
                                <p className="text-[9px] font-black text-slate-700 text-center uppercase tracking-widest mt-2">+ {dayApps.length - 3} Horários</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700 shadow-2xl">
                <CalendarIcon className="w-10 h-10" />
            </div>
            <div className="max-w-xs mx-auto">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Agenda Vazia</h3>
                <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest mt-2 leading-relaxed">Nenhum compromisso agendado para o período selecionado.</p>
            </div>
        </div>
    );
}
