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
                api.get('/appointments/pro'),
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
        <div className="space-y-6 pb-20 text-slate-900 dark:text-white">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Agenda da Equipe</h1>
                    <p className="text-slate-500 text-sm font-medium italic">Gestão operacional em tempo real</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                        {['day', 'week', 'month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto justify-between md:justify-start">
                        <button onClick={prev} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                        <div className="px-4 text-center min-w-[140px]">
                            <p className="font-black text-xs text-orange-500 uppercase">
                                {viewMode === 'day' ? format(currentDate, 'dd MMMM', { locale: ptBR }) :
                                    viewMode === 'week' ? `Semana de ${format(startOfWeek(currentDate), 'dd/MM')}` :
                                        format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            </p>
                        </div>
                        <button onClick={next} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition shadow-sm"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                    </div>
                </div>
            </header>

            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedPro('all')}
                    className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${selectedPro === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
                >
                    Todos Profissionais
                </button>
                {professionals.map(pro => (
                    <button
                        key={pro.id}
                        onClick={() => setSelectedPro(pro.id)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${selectedPro === pro.id ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedPro === pro.id ? 'bg-white' : 'bg-green-500'}`}></div>
                        {pro.name}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
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
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {appointments.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => (
                <div key={app.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col md:flex-row items-start md:items-center gap-8 group">
                    <div className="text-center md:border-r border-slate-100 dark:border-slate-800 pr-8 min-w-[120px]">
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                            {format(new Date(app.date), 'HH:mm')}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-black uppercase mt-2 tracking-widest">Confirmado</p>
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-black">{app.client?.name.charAt(0)}</div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white">{app.client?.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.client?.phone}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                <Scissors className="w-3.5 h-3.5 text-orange-500" /> {app.service?.name}
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                <User className="w-3.5 h-3.5 text-slate-300" /> {app.summaryProName || professionals.find(p => p.id === app.professionalId)?.name}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <a
                            href={`https://wa.me/55${app.client?.phone?.replace(/\D/g, '')}?text=Olá ${app.client?.name}! Confirmamos seu horário às ${format(new Date(app.date), 'HH:mm')} na Corte %26 Conexão.`}
                            target="_blank"
                            className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 text-center"
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
                            className="flex-1 md:flex-none bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition text-center"
                        >
                            Cancelar
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
                return (
                    <div key={i} className={`min-h-[500px] border-r border-slate-50 dark:border-slate-800 flex flex-col ${isSameDay(day, new Date()) ? 'bg-orange-50/20 dark:bg-orange-900/5' : ''}`}>
                        <div className="p-4 text-center border-b border-slate-50 dark:border-slate-800">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{format(day, 'EEE', { locale: ptBR })}</p>
                            <p className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full font-black text-sm ${isSameDay(day, new Date()) ? 'bg-orange-500 text-white' : 'text-slate-900 dark:text-white'}`}>
                                {format(day, 'd')}
                            </p>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] scrollbar-hide">
                            {dayApps.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => (
                                <div key={app.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                                    <p className="font-black text-[10px] text-slate-900 dark:text-white leading-none">{format(new Date(app.date), 'HH:mm')}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 truncate">{app.client?.name}</p>
                                    <p className="text-[9px] text-orange-500 font-black uppercase mt-1 truncate">{app.service?.name}</p>
                                </div>
                            ))}
                            {dayApps.length === 0 && (
                                <div className="h-full flex items-center justify-center opacity-20">
                                    <p className="text-[8px] font-black uppercase tracking-tighter -rotate-90">LIVRE</p>
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
                <div key={d} className="p-4 text-center border-b border-slate-50 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{d}</p>
                </div>
            ))}
            {days.map((day, i) => {
                const dayApps = getFilteredAppointments(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                return (
                    <div key={i} className={`min-h-[120px] p-2 border-r border-b border-slate-50 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!isCurrentMonth ? 'opacity-20 bg-slate-50 pointer-events-none' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-black ${isSameDay(day, new Date()) ? 'bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                                {format(day, 'd')}
                            </span>
                            {dayApps.length > 0 && (
                                <span className="bg-orange-500/10 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                    {dayApps.length} {dayApps.length === 1 ? 'Job' : 'Jobs'}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            {dayApps.slice(0, 3).map(app => (
                                <div key={app.id} className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-slate-500 truncate border-l-2 border-orange-500">
                                    {format(new Date(app.date), 'HH:mm')} - {app.client?.name}
                                </div>
                            ))}
                            {dayApps.length > 3 && (
                                <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest mt-1">+{dayApps.length - 3} mais</p>
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
        <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                <CalendarIcon className="w-10 h-10" />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sem agendamentos</h3>
                <p className="text-slate-500 text-xs font-medium italic">Nenhum registro encontrado para este filtro.</p>
            </div>
        </div>
    );
}
