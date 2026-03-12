'use client';
import { Scissors, Clock, Banknote, ChevronRight } from 'lucide-react';

export default function ServicesTab({ services, onSelect }) {
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!services || services.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum serviço encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
            {services.map(service => (
                <div
                    key={service.id}
                    onClick={() => onSelect(service)}
                    className="group bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-[2px] rounded-3xl cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="bg-[#0b0f19] rounded-[22px] p-5 h-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">

                        {/* Subtle Background Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>

                        <div className="flex gap-4 items-start w-full sm:w-auto relative z-10">
                            {/* Premium Icon Container */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                <Scissors className="w-6 h-6 text-emerald-500" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg uppercase tracking-tight leading-tight mb-2 group-hover:text-emerald-400 transition-colors">
                                    {service.name}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                                        <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold text-white tracking-wider">{formatCurrency(service.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{service.duration} min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0 relative z-10">
                            <button className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all w-full sm:w-auto border border-transparent hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                Agendar
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
