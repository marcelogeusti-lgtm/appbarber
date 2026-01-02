'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Calendar as CalendarIcon, Clock, User, Scissors, ChevronLeft, ChevronRight, Filter, LayoutGrid, List } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SchedulePage() {
    const [appointments, setAppointments] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day'); // day, week, month

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const [appRes, proRes] = await Promise.all([
                api.get(`/appointments?barbershopId=${bId}`),
                api.get(`/professionals?barbershopId=${bId}`)
            ]);

            setAppointments(appRes.data);
            setProfessionals(proRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Sincronizando agenda...</div>;

    return (
        <div className="space-y-6 pb-20 text-slate-300">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Agenda Operacional</h1>
                    <p className="text-slate-500 text-sm font-medium italic">Monitoramento e gestão de horários em tempo real</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full md:w-auto">
                        {['day', 'week', 'month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-[#111827] text-emerald-500 shadow-xl border border-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 w-full md:w-auto justify-between md:justify-start">
                        <button onClick={prev} className="p-2 hover:bg-[#111827] rounded-xl transition shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                        <div className="px-4 text-center min-w-[140px]">
                            <p className="font-black text-xs text-emerald-500 uppercase tracking-widest">
                                {viewMode === 'day' ? format(currentDate, 'dd MMMM', { locale: ptBR }) :
                                    viewMode === 'week' ? `Semana de ${format(startOfWeek(currentDate), 'dd/MM')}` :
                                        format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            </p>
                        </div>
                        <button onClick={next} className="p-2 hover:bg-[#111827] rounded-xl transition shadow-sm"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                    </div>
                </div>
            </header>

            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                <button
                    onClick={() => setSelectedPro('all')}
                    className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${selectedPro === 'all' ? 'bg-white text-[#111827] border-white shadow-xl shadow-white/5' : 'bg-[#111827] text-slate-500 border-slate-800 hover:border-slate-700'}`}
                >
                    Todos Profissionais
                </button>
                {professionals.map(pro => (
                    <button
                        key={pro.id}
                        onClick={() => setSelectedPro(pro.id)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${selectedPro === pro.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-[#111827] text-slate-500 border-slate-800 hover:border-slate-700'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedPro === pro.id ? 'bg-white' : 'bg-emerald-500'}`}></div>
                        {pro.name}
                    </button>
                ))}
            </div>

            <div className="bg-[#111827] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[500px]">
                {viewMode === 'day' && <DayView appointments={getFilteredAppointments(currentDate)} professionals={professionals} selectedPro={selectedPro} />}
                {viewMode === 'week' && <WeekView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} />}
                {viewMode === 'month' && <MonthView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} />}
            </div>
        </div>
    );
}

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

                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 font-black group-hover:scale-110 transition-transform">
                                {app.client?.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tight text-white">{app.client?.name}</h4>
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

function WeekView({ currentDate, getFilteredAppointments, professionals, selectedPro }) {
    const weekStart = startOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

    return (
        <div className="grid grid-cols-7 h-full border-collapse">
            {days.map((day, i) => {
                const dayApps = getFilteredAppointments(day);
                const isToday = isSameDay(day, new Date());
                return (
                    <div key={i} className={`min-h-[500px] border-r border-slate-800 flex flex-col ${isToday ? 'bg-emerald-500/5' : ''}`}>
                        <div className="p-6 text-center border-b border-slate-800">
                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] mb-2">{format(day, 'EEE', { locale: ptBR })}</p>
                            <p className={`w-10 h-10 flex items-center justify-center mx-auto rounded-xl font-black text-sm tracking-tighter ${isToday ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-200 border border-slate-800 bg-slate-950'}`}>
                                {format(day, 'd')}
                            </p>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] scrollbar-hide py-4">
                            {dayApps.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => (
                                <div key={app.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all group group cursor-pointer">
                                    <p className="font-black text-[11px] text-white leading-none tracking-widest">{format(new Date(app.date), 'HH:mm')}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-2 truncate group-hover:text-slate-300 transition-colors uppercase">{app.client?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase truncate tracking-tighter">{app.service?.name}</p>
                                    </div>
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

function MonthView({ currentDate, getFilteredAppointments, professionals, selectedPro }) {
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
                    <div key={i} className={`min-h-[140px] p-4 border-r border-b border-slate-800 group hover:bg-emerald-500/5 transition-all ${!isCurrentMonth ? 'opacity-10 bg-slate-950 pointer-events-none' : ''}`}>
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
