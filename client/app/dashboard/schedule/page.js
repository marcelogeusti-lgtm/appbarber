'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Calendar as CalendarIcon, Clock, User, Scissors, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, PlusCircle, AlertCircle, XCircle } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, subDays, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import SqueezeInModal from '../../../components/SqueezeInModal';
import DayDetailsModal from '../../../components/DayDetailsModal';
import EditModal from '../../../components/EditModal';
import AppointmentDetailsModal from '../../../components/AppointmentDetailsModal';
import NewOrderModal from '../../../components/NewOrderModal';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import PrintButton from '../../../components/PrintButton';
import { useSocket } from '../../../contexts/SocketContext';
import { useQuery } from '@tanstack/react-query';

export default function SchedulePage() {
    const socket = useSocket();

    // Centralized Barbershop Data from Cache
    const { data: barbershop } = useQuery({
        queryKey: ['barbershop-me'],
        queryFn: async () => {
            const res = await api.get('/barbershops/me');
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    });

    const [appointments, setAppointments] = useState([]);
    const [waitlist, setWaitlist] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day');
    const [activeTab, setActiveTab] = useState('appointments');
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [viewingAppointment, setViewingAppointment] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isSqueezeInOpen, setIsSqueezeInOpen] = useState(false);
    const [dayDetailsDate, setDayDetailsDate] = useState(null);

    const [loadedRange, setLoadedRange] = useState({ start: null, end: null });
    const [lastFetchedMonth, setLastFetchedMonth] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);

    // Pagination States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [user, setUser] = useState(null);

    // Sync barbershopId when query data arrives
    useEffect(() => {
        if (barbershop?.id) {
            setBarbershopId(barbershop.id);
        }
    }, [barbershop]);

    const fetchData = () => {
        if (viewMode === 'day') {
            fetchAppointments();
        } else {
            fetchAllAppointmentsInRange();
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchResources();
    }, []);

    useEffect(() => {
        if (!barbershopId) return;

        if (viewMode === 'day') {
            fetchAppointments();
        } else {
            fetchAllAppointmentsInRange();
        }

        if (socket && barbershopId) {
            socket.emit('join_barbershop', barbershopId);
            socket.on('new_appointment', (data) => {
                if (viewMode === 'day') {
                    fetchAppointments();
                } else {
                    fetchAllAppointmentsInRange();
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('new_appointment');
            }
        };
    }, [currentDate, viewMode, barbershopId, page, limit, socket]);

    const fetchResources = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Derive shop ID from cached data or user object
            const bId = barbershop?.id || user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            if (bId && !barbershopId) setBarbershopId(bId);

            if (!bId) return;

            // Professionals
            if (professionals.length === 0) {
                const proRes = await api.get(`/professionals?barbershopId=${bId}`);
                const pros = Array.isArray(proRes.data) ? proRes.data : (proRes.data.data || []);
                setProfessionals(pros);

                if (user.role === 'BARBER') {
                    const myPro = pros.find(p => p.email === user.email);
                    if (myPro) setSelectedPro(myPro.id);
                }
            }

            // Services
            if (services.length === 0) {
                const srvRes = await api.get(`/services?barbershopId=${bId}&active=true&limit=1000`);
                setServices(Array.isArray(srvRes.data) ? srvRes.data : (srvRes.data.data || []));
            }
        } catch (err) {
            console.error('fetchResources error:', err);
        }
    };

    const fetchAppointments = async () => {
        if (!barbershopId || barbershopId === 'null' || barbershopId === 'undefined') {
            console.log('[DEBUG] fetchAppointments skipped: invalid barbershopId', barbershopId);
            return;
        }
        setLoading(true);
        try {
            const start = startOfDay(currentDate).toISOString();
            const end = endOfDay(currentDate).toISOString();

            console.log(`[DEBUG] fetchAppointments calling /appointments for ${barbershopId}, range: ${start} - ${end}`);
            const res = await api.get(`/appointments?barbershopId=${barbershopId}&start=${start}&end=${end}&page=${page}&limit=${limit}`);
            console.log('[DEBUG] fetchAppointments response count:', res.data.data?.length);

            setAppointments(res.data.data || []);
            setTotalItems(res.data.total || 0);
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error('[DEBUG] fetchAppointments error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAppointmentsInRange = async () => {
        if (!barbershopId || barbershopId === 'null' || barbershopId === 'undefined') {
            console.log('[DEBUG] fetchAllInRange skipped: invalid barbershopId', barbershopId);
            return;
        }
        setLoading(true);
        try {
            // Load 3 months to be safe on calendar navigation
            const start = startOfMonth(subMonths(currentDate, 1)).toISOString();
            const end = endOfMonth(addMonths(currentDate, 1)).toISOString();

            console.log(`[DEBUG] fetchAllInRange calling /appointments for ${barbershopId}, range: ${start} - ${end}`);
            const res = await api.get(`/appointments?barbershopId=${barbershopId}&start=${start}&end=${end}&limit=1000`);
            console.log('[DEBUG] fetchAllInRange response count:', res.data.data?.length);
            setAppointments(res.data.data || []);
        } catch (err) {
            console.error('[DEBUG] fetchAllInRange error:', err);
        } finally {
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
        if (!barbershopId || barbershopId === 'null' || barbershopId === 'undefined') return;
        try {
            const res = await api.get(`/waitlist`, {
                params: {
                    barbershopId: barbershopId,
                    date: currentDate.toISOString(),
                    professionalId: selectedPro
                }
            });
            setWaitlist(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNext = () => {
        setPage(1);
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const handlePrev = () => {
        setPage(1);
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const getFilteredAppointments = (date) => {
        return appointments.filter(a => {
            const sameDay = isSameDay(new Date(a.date), date);
            const samePro = selectedPro === 'all' || a.professionalId === selectedPro;
            return sameDay && samePro;
        });
    };

    const handleSqueezeIn = async () => {
        alert("Para realizar um encaixe, utilize o botão 'Novo Agendamento' no menu lateral e marque a opção 'Encaixe' (se disponível) ou apenas force o horário.");
    };

    const handleViewClick = (appointment) => {
        setViewingAppointment(appointment);
    };

    const handleEditFromDetails = () => {
        if (!viewingAppointment) return;
        setViewingAppointment(null); // Close details

        // Prepare for edit
        setEditingAppointment({
            ...viewingAppointment,
            dateOnly: format(new Date(viewingAppointment.date), 'yyyy-MM-dd'),
            timeOnly: format(new Date(viewingAppointment.date), 'HH:mm'),
        });
        setIsEditModalOpen(true);
    };


    const handleUpdateAppointment = async () => {
        if (!editingAppointment) return;
        try {
            setLoading(true);
            const newDateTime = `${editingAppointment.dateOnly}T${editingAppointment.timeOnly}:00`;

            await api.patch(`/appointments/${editingAppointment.id}`, {
                date: new Date(newDateTime).toISOString(),
                status: editingAppointment.status,
                serviceId: editingAppointment.serviceId,
                professionalId: editingAppointment.professionalId,
                notes: editingAppointment.notes
            });

            setIsEditModalOpen(false);
            setEditingAppointment(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar agendamento');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteAppointment = async (appointmentId, paymentMethod, options = {}) => {
        try {
            setLoading(true);
            await api.patch(`/appointments/${appointmentId}/status`, {
                status: 'COMPLETED',
                paymentMethod: paymentMethod // Optional, only if passed (Local Payment)
            });

            // Refresh
            setViewingAppointment(null);
            fetchData();
            alert('Atendimento finalizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao finalizar atendimento: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && professionals.length === 0) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs">Sincronizando agenda...</div>;

    const selectedProData = professionals.find(p => p.id === selectedPro);

    return (
        <div className="space-y-6 pb-20 text-muted-foreground">
            {/* Header Redesign */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm relative overflow-hidden">
                <div className="relative z-10 w-full xl:w-auto">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">
                        AGENDA OPERACIONAL {appointments.length > 0 ? `(${appointments.length})` : ''}
                    </h1>

                    {/* Professional Selector (Dropdown) */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <select
                                value={selectedPro}
                                onChange={(e) => user?.role !== 'BARBER' && setSelectedPro(e.target.value)}
                                disabled={user?.role === 'BARBER'}
                                className={`appearance-none bg-background text-foreground pl-12 pr-12 py-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-muted transition min-w-[280px] ${user?.role === 'BARBER' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {user?.role !== 'BARBER' && <option value="all">Todos Profissionais</option>}
                                {professionals.map(pro => (
                                    <option key={pro.id} value={pro.id}>{pro.name}</option>
                                ))}
                            </select>
                            <User className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
                                ▼
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-3 bg-background p-2 rounded-xl border border-border w-full sm:w-auto justify-between sm:justify-start">
                            <button onClick={handlePrev} className="p-2 hover:bg-muted rounded-xl transition shadow-sm"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
                            <div className="px-4 text-center min-w-[140px]">
                                <p className="font-black text-xs text-foreground uppercase tracking-widest">
                                    {viewMode === 'day' ? format(currentDate, 'dd MMMM', { locale: ptBR }) :
                                        viewMode === 'week' ? `Semana ${format(startOfWeek(currentDate), 'dd/MM')}` :
                                            format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                </p>
                            </div>
                            <button onClick={handleNext} className="p-2 hover:bg-muted rounded-xl transition shadow-sm"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto relative z-10">

                    {/* View Mode */}
                    <div className="flex bg-background p-1 rounded-xl border border-border w-full sm:w-auto">
                        {['day', 'week', 'month'].map(v => (
                            <button
                                key={v}
                                onClick={() => { setViewMode(v); setPage(1); }} // Reset page on view mode change
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-card text-primary shadow-xl border border-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    <PrintButton />

                    {/* Squeeze In Button */}
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST') && (
                        <button
                            onClick={() => setIsSqueezeInOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-xl shadow-primary/20"
                        >
                            <PlusCircle className="w-4 h-4" /> Encaixe Rápido
                        </button>
                    )}
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-4 border-b border-border/50 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'appointments' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                >
                    Agendamentos
                </button>
                <button
                    onClick={() => setActiveTab('waitlist')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'waitlist' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                >
                    Lista de Espera
                    {waitlist.length > 0 && <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[9px]">{waitlist.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'availability' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                >
                    Horários Livres
                </button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden min-h-[600px]">
                {activeTab === 'appointments' && (
                    <>
                        {viewMode === 'day' && (
                            <>
                                <DayView appointments={getFilteredAppointments(currentDate)} professionals={professionals} selectedPro={selectedPro} onEdit={handleViewClick} barbershopName={barbershop?.name} />
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    limit={limit}
                                    onPageChange={setPage}
                                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                                    label="agendamentos"
                                />
                            </>
                        )}
                        {viewMode === 'week' && <WeekView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} onDayClick={setDayDetailsDate} onEdit={handleViewClick} />}
                        {viewMode === 'month' && <MonthView currentDate={currentDate} getFilteredAppointments={getFilteredAppointments} professionals={professionals} selectedPro={selectedPro} onDayClick={setDayDetailsDate} onEdit={handleViewClick} />}
                    </>
                )}

                {activeTab === 'waitlist' && (
                    <WaitlistView waitlist={waitlist} professionals={professionals} />
                )}

                {activeTab === 'availability' && (
                    <AvailabilityView
                        currentDate={currentDate}
                        professionals={professionals}
                        selectedPro={selectedPro}
                        barbershopId={barbershopId}
                        services={services}
                    />
                )}
            </div>

            <SqueezeInModal
                isOpen={isSqueezeInOpen}
                onClose={() => setIsSqueezeInOpen(false)}
                services={services}
                professionals={professionals}
                barbershopId={barbershopId}
                onConfirm={handleSqueezeInConfirm}
            />

            <DayDetailsModal
                isOpen={!!dayDetailsDate}
                onClose={() => setDayDetailsDate(null)}
                date={dayDetailsDate || new Date()}
                appointments={dayDetailsDate ? getFilteredAppointments(dayDetailsDate) : []}
                professionals={professionals}
            />

            <AppointmentDetailsModal
                isOpen={!!viewingAppointment}
                onClose={() => setViewingAppointment(null)}
                appointment={viewingAppointment}
                onEdit={handleEditFromDetails}
                onComplete={handleCompleteAppointment}
            />

            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Agendamento"
                onSave={handleUpdateAppointment}
                loading={loading}
            >
                {editingAppointment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
                                <input
                                    type="date"
                                    value={editingAppointment.dateOnly}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, dateOnly: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Horário</label>
                                <input
                                    type="time"
                                    value={editingAppointment.timeOnly}
                                    onChange={(e) => setEditingAppointment({ ...editingAppointment, timeOnly: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                            <select
                                value={editingAppointment.status}
                                onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary"
                            >
                                <option value="PENDING">Pendente</option>
                                <option value="CONFIRMED">Confirmado</option>
                                <option value="COMPLETED">Concluído</option>
                                <option value="CANCELLED">Cancelado</option>
                                <option value="NO_SHOW">Não Compareceu</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Profissional</label>
                            <select
                                value={editingAppointment.professionalId}
                                onChange={(e) => setEditingAppointment({ ...editingAppointment, professionalId: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary"
                            >
                                {professionals.map(pro => (
                                    <option key={pro.id} value={pro.id}>{pro.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Notas</label>
                            <textarea
                                value={editingAppointment.notes || ''}
                                onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary h-24 resize-none"
                                placeholder="Notas internas..."
                            />
                        </div>
                    </div>
                )}
            </EditModal>
        </div>
    );
}

function WaitlistView({ waitlist, professionals }) {
    if (waitlist.length === 0) return (
        <div className="py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-card rounded-xl border border-border flex items-center justify-center mx-auto text-muted-foreground shadow-inner">
                <Clock className="w-10 h-10" />
            </div>
            <div className="max-w-xs mx-auto">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Lista Vazia</h3>
                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mt-2 leading-relaxed">Nenhum cliente na lista de espera para este dia.</p>
            </div>
        </div>
    );

    return (
        <div className="divide-y divide-border/50">
            {waitlist.map(entry => (
                <div key={entry.id} className="p-8 hover:bg-primary/5 transition flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-background rounded-xl border border-border flex items-center justify-center text-muted-foreground font-black text-xl">
                            {entry.clientName?.charAt?.(0)}
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-foreground uppercase tracking-tight">{entry.clientName}</h4>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 mb-2">{entry.service?.name}</p>
                            <span className="bg-background text-muted-foreground border border-border px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                Aguardando desde {format(new Date(entry.createdAt), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                        Agendar
                    </button>
                </div>
            ))}
        </div>
    );
}

// ... Keep DayView, WeekView, MonthView, EmptyState as is (or include them below if replacing entire file)
// Since I am rewriting the file, I must include them.

function DayView({ appointments, professionals, selectedPro, onEdit, barbershopName }) {
    if (appointments.length === 0) return <EmptyState />;

    // Sort logic here?
    // If not sorted, let's sort
    const sortedApps = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="divide-y divide-border/50">
            {sortedApps.map(app => {
                const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                const statusColor = isCancelled ? 'text-red-500 border-red-500/20' : 'text-primary border-primary/20';
                const statusText = app.status === 'CANCELLED' ? 'Cancelado' :
                    app.status === 'NO_SHOW' ? 'Não Compareceu' :
                        app.status === 'COMPLETED' ? 'Concluído' : 'Confirmado';

                return (
                    <div key={app.id} className={`p-8 transition flex flex-col md:flex-row items-start md:items-center gap-8 group ${isCancelled ? 'bg-red-500/5 hover:bg-red-500/10 opacity-70 hover:opacity-100' : 'hover:bg-primary/5'}`}>
                        <div className="text-center md:border-r border-border pr-8 min-w-[120px]">
                            <p className={`text-3xl font-black leading-none tracking-tighter ${isCancelled ? 'text-red-500 line-through decoration-2 decoration-red-500' : 'text-foreground'}`}>
                                {format(new Date(app.date), 'HH:mm')}
                            </p>
                            <p className={`text-[10px] font-black uppercase mt-2 tracking-widest border px-2 py-0.5 rounded ${statusColor}`}>
                                {statusText}
                            </p>
                        </div>

                        <div className="flex-1 space-y-3 cursor-pointer" onClick={() => onEdit && onEdit(app)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl border border-border flex items-center justify-center font-black group-hover:scale-110 transition-transform ${isCancelled ? 'bg-red-500/10 text-red-500' : 'bg-background text-muted-foreground'}`}>
                                    {app.client?.name?.charAt?.(0)}
                                </div>
                                <div>
                                    <h4 className={`font-black text-lg uppercase tracking-tight transition-colors ${isCancelled ? 'text-red-400' : 'text-foreground group-hover:text-primary'}`}>{app.client?.name}</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div> {app.client?.phone}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors ${isCancelled ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'text-muted-foreground bg-background border-border group-hover:border-primary/30'}`}>
                                    <Scissors className={`w-3.5 h-3.5 ${isCancelled ? 'text-red-500' : 'text-primary'}`} /> {app.service?.name}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 px-4 py-2 rounded-xl border border-border">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" /> {app.summaryProName || professionals.find(p => p.id === app.professionalId)?.name}
                                </span>
                                {app.isSqueezeIn && (
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                        Encaixe
                                    </span>
                                )}
                                {isCancelled && (
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                        Horário Liberado
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isCancelled && (
                            <div className="flex gap-2 w-full md:w-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <a
                                    href={`https://wa.me/55${app.client?.phone?.replace(/\D/g, '')}?text=Olá ${app.client?.name}! Confirmamos seu horário às ${format(new Date(app.date), 'HH:mm')} na ${encodeURIComponent(barbershopName)}.`}
                                    target="_blank"
                                    className="flex-1 md:flex-none bg-primary text-primary-foreground px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition shadow-xl shadow-primary/20 text-center"
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
                                    className="flex-1 md:flex-none bg-card text-destructive border border-border px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition text-center"
                                >
                                    Excluir
                                </button>
                            </div>
                        )}
                        {isCancelled && (
                            <div className="flex gap-2 w-full md:w-auto opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => onEdit && onEdit(app)} // Opens edit modal to allow restoring nicely if needed
                                    className="flex-1 md:flex-none bg-card text-muted-foreground border border-border px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-foreground transition text-center"
                                >
                                    Detalhes
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function WeekView({ currentDate, getFilteredAppointments, professionals, selectedPro, onDayClick, onEdit }) {
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
                        onClick={() => onDayClick(day)} // Still opens DayDetailsModal if clicking emptiness
                        className={`min-h-[500px] border-r border-border flex flex-col cursor-pointer hover:bg-muted/20 transition ${isToday ? 'bg-primary/5' : ''}`}
                    >
                        <div className="p-6 text-center border-b border-border">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">{format(day, 'EEE', { locale: ptBR })}</p>
                            <p className={`w-10 h-10 flex items-center justify-center mx-auto rounded-xl font-black text-sm tracking-tighter ${isToday ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground border border-border bg-card'}`}>
                                {format(day, 'd')}
                            </p>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] scrollbar-hide py-4">
                            {dayApps.sort((a, b) => new Date(a.date) - new Date(b.date)).map(app => {
                                const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                                return (
                                    (
                                        <div
                                            key={app.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent opening DayDetailsModal
                                                onEdit && onEdit(app);
                                            }}
                                            className={`p-4 rounded-xl border shadow-sm transition-all group group hover:bg-card cursor-pointer ${isCancelled ? 'bg-red-500/5 border-red-500/20 opacity-70' : 'bg-background border-border hover:border-primary/40'}`}
                                        >
                                            <p className={`font-black text-[11px] leading-none tracking-widest ${isCancelled ? 'text-red-500 line-through' : 'text-foreground'}`}>{format(new Date(app.date), 'HH:mm')}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground mt-2 truncate group-hover:text-foreground transition-colors uppercase">{app.client?.name}</p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className={`w-1 h-1 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-primary'}`}></div>
                                                <p className="text-[9px] text-primary font-black uppercase truncate tracking-tighter">{app.service?.name}</p>
                                            </div>
                                            {app.isSqueezeIn && <div className="mt-1 text-[8px] text-primary uppercase font-black">Encaixe</div>}
                                        </div>
                                    ))
                            })}
                            {dayApps.length === 0 && (
                                <div className="h-full flex items-center justify-center opacity-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] -rotate-90 text-muted-foreground">Disponível</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthView({ currentDate, getFilteredAppointments, professionals, selectedPro, onDayClick, onEdit }) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStart = startOfWeek(monthStart);
    const days = eachDayOfInterval({ start: weekStart, end: endOfMonth(monthEnd) });

    return (
        <div className="grid grid-cols-7 h-full">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="p-6 text-center border-b border-border bg-card/20">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{d}</p>
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
                        className={`min-h-[140px] p-4 border-r border-b border-border group hover:bg-primary/5 transition-all cursor-pointer ${!isCurrentMonth ? 'opacity-10 bg-card pointer-events-none' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-[12px] font-black tracking-tighter ${isToday ? 'bg-primary text-primary-foreground w-7 h-7 flex items-center justify-center rounded-lg shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}>
                                {format(day, 'd')}
                            </span>
                            {dayApps.length > 0 && (
                                <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-primary/20">
                                    {dayApps.length} Jobs
                                </span>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            {dayApps.slice(0, 3).map(app => {
                                const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                                return (
                                    <div
                                        key={app.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit && onEdit(app);
                                        }}
                                        className={`text-[8px] bg-background px-2 py-1.5 rounded-lg font-black text-muted-foreground truncate border group-hover:border-primary/30 hover:border-primary transition-colors cursor-pointer ${isCancelled ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'border-border'}`}
                                    >
                                        <span className={`font-mono ${isCancelled ? 'line-through text-red-500' : 'text-primary'}`}>{format(new Date(app.date), 'HH:mm')}</span> {app.client?.name}
                                    </div>
                                )
                            })}
                            {dayApps.length > 3 && (
                                <p className="text-[9px] font-black text-muted-foreground text-center uppercase tracking-widest mt-2">+ {dayApps.length - 3} Horários</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


function AvailabilityView({ currentDate, professionals, selectedPro, barbershopId, services }) {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const servicesList = Array.isArray(services) ? services : (services?.data || []);
        if (!barbershopId || servicesList.length === 0) return;

        // Let's use the shortest service or the first service to get maximum granularity of 30min blocks
        const targetService = servicesList.find(s => s.duration === 30) || servicesList[0];
        if (!targetService) return;

        const fetchAvail = async () => {
            setLoading(true);
            try {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                const res = await api.get(`/availability/${barbershopId}/${dateStr}`, {
                    params: { serviceIds: targetService.id }
                });
                setAvailability(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAvail();
    }, [currentDate, barbershopId, services]);

    if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse text-xs font-bold uppercase tracking-widest">Calculando matriz de horários...</div>;

    const filteredAvail = selectedPro === 'all' ? availability : availability.filter(a => a.proId === selectedPro);

    if (filteredAvail.length === 0) return (
        <div className="p-20 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
            Nenhum profissional com escala encontrada ou não há serviços.
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {filteredAvail.map(pro => (
                <div key={pro.proId} className="space-y-4">
                    <h4 className="font-black text-lg uppercase tracking-tight text-foreground flex items-center gap-2 pb-2 border-b border-border/50 w-full">
                        <User className="w-4 h-4 text-primary" /> {pro.proName}
                    </h4>
                    {pro.slots.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                            {pro.slots.map(time => (
                                <div key={time} className="bg-primary/10 text-primary border border-primary/20 p-3 rounded-xl text-center font-black text-[12px] shadow-sm hover:scale-105 transition-transform cursor-default">
                                    {time}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest bg-muted/20 p-4 rounded-xl inline-block">Nenhum horário livre.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-card rounded-xl border border-border flex items-center justify-center mx-auto text-muted-foreground shadow-2xl">
                <CalendarIcon className="w-10 h-10" />
            </div>
            <div className="max-w-xs mx-auto">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Agenda Vazia</h3>
                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mt-2 leading-relaxed">Nenhum compromisso agendado para o período selecionado.</p>
            </div>
        </div>
    );
}
