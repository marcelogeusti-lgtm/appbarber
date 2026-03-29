import { X, Calendar, Clock, User, Scissors, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

export default function DayDetailsModal({ isOpen, onClose, date, appointments, professionals }) {
    if (!isOpen) return null;

    // Sort by time
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate specific timeline (optional, or just list)
    // For now, let's list them clearly

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center bg-black/80 backdrop-blur-sm sm:p-4 transition-all overflow-hidden">
            <div
                className={`bg-[#0F111A] w-full max-w-2xl sm:rounded-[2.5rem] border-l sm:border sm:border-slate-800/50 shadow-2xl h-full sm:h-[85vh] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-800/50 flex justify-between items-start bg-slate-900/20 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                            {format(date, 'dd/MM/yyyy')}
                        </h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {format(date, 'EEEE', { locale: ptBR })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {sortedAppointments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nenhum agendamento para este dia.</p>
                        </div>
                    ) : (
                        sortedAppointments.map((app, index) => {
                            const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                            const isCompleted = app.status === 'COMPLETED';

                            // Visual Styles
                            const borderColor = isCancelled ? 'border-red-500/20' : isCompleted ? 'border-emerald-500/20' : 'border-blue-500/20';
                            const bgColor = isCancelled ? 'bg-red-500/5' : isCompleted ? 'bg-emerald-500/5' : 'bg-blue-500/5';
                            const textColor = isCancelled ? 'text-red-500' : isCompleted ? 'text-emerald-500' : 'text-blue-500';
                            const iconColor = isCancelled ? 'text-red-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400';

                            return (
                                <div key={app.id} className="relative pl-8 border-l-2 border-slate-800 last:border-l-0 pb-8 last:pb-0 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#0F111A] ${isCancelled ? 'bg-red-500' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                                    {/* Time */}
                                    <span className={`text-xs font-black uppercase tracking-widest mb-2 block ${isCancelled ? 'text-red-500 line-through' : 'text-slate-400'}`}>
                                        {format(new Date(app.date), 'HH:mm')}
                                    </span>

                                    {/* Card */}
                                    <div className={`rounded-2xl border p-6 transition-all ${borderColor} ${bgColor} hover:border-opacity-40`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`font-black text-lg uppercase tracking-tight text-white ${isCancelled ? 'opacity-50' : ''}`}>
                                                    {app.service?.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="w-3 h-3 text-slate-500" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {app.client?.name} {app.isSqueezeIn && <span className="text-orange-500">(Encaixe)</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Status Badge */}
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-black/20 border border-white/5 ${textColor}`}>
                                                    {app.status === 'PENDING' ? 'Pendente' :
                                                        app.status === 'CONFIRMED' ? 'Confirmado' :
                                                            app.status === 'COMPLETED' ? 'Concluído' :
                                                                app.status === 'NO_SHOW' ? 'No-Show' : 'Cancelado'}
                                                </span>
                                                {isCancelled && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
                                                        Horário Liberado
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Scissors className="w-3 h-3" /> Profissional
                                                </p>
                                                <p className="text-sm font-bold text-slate-300">
                                                    {professionals.find(p => p.id === app.professionalId)?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Duração
                                                </p>
                                                <p className="text-sm font-bold text-slate-300">
                                                    {app.service?.duration} min
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
