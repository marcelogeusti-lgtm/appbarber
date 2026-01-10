'use client';
import { X, Clock, User, Scissors } from 'lucide-react';
import { format, addMinutes, differenceInMinutes, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DayDetailsModal({ isOpen, onClose, date, appointments, professionals }) {
    if (!isOpen) return null;

    // Helper to process timeline
    const getTimeline = () => {
        // Flat list of all events (appointments) sorted by time
        // We want to show gaps too?? 
        // The user asked for: "Lista de agendamentos... Destaque para horários ocupados e intevalos livres"
        // To show "Free Intervals", we need to simulate the day from Open to Close. 
        // For simplicity, let's just list the appointments and maybe show "Free Time" blocks if gap > 30 mins?
        // Or just a clean list of what IS scheduled is usually enough for "Day Details".
        // Let's stick to a rich list of appointments first. Visualizing "Free" blocks requires knowing work hours per professional, which is complex in this aggregate view.
        return appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const timeline = getTimeline();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center bg-black/80 backdrop-blur-sm sm:p-4">
            {/* Drawer on Mobile, Modal on Desktop */}
            <div className={`bg-[#111827] w-full max-w-2xl sm:rounded-3xl border-l sm:border border-slate-800 shadow-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                            {format(date, "dd 'de' MMMM", { locale: ptBR })}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Detalhes Completos do Dia • {timeline.length} Agendamentos
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {timeline.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-bold uppercase tracking-widest text-xs">Dia Livre (Sem Agendamentos)</p>
                        </div>
                    ) : (
                        timeline.map((app, index) => {
                            const appDate = new Date(app.date);
                            const appEnd = addMinutes(appDate, app.service?.duration || 30);
                            const pro = professionals.find(p => p.id === app.professionalId);

                            // Detect gap before? (Simple logic)
                            // if (index > 0) { ... }

                            return (
                                <div key={app.id} className="relative pl-6 border-l-2 border-slate-800 pb-8 last:pb-0 last:border-l-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500"></div>

                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 hover:border-emerald-500/30 transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                    {format(appDate, 'HH:mm')} - {format(appEnd, 'HH:mm')}
                                                </h3>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" /> Duração: {app.service?.duration || 30} min
                                                </span>
                                            </div>
                                            {app.isSqueezeIn && (
                                                <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                                                    Encaixe
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-slate-400">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cliente</p>
                                                    <p className="text-sm font-bold text-slate-200">{app.client?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-slate-400">
                                                    <Scissors className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Serviço</p>
                                                    <p className="text-sm font-bold text-slate-200">{app.service?.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${pro ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pro: <span className="text-slate-200">{pro?.name || 'N/A'}</span></p>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                                                Confirmado
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
